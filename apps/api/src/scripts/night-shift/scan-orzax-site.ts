/**
 * Orzax site crawler — BİRİNCİL kaynak: orzax.com.tr
 *
 * Flow:
 *   1. Fetch product-sitemap.xml → extract all product URLs
 *   2. Fetch each product page HTML
 *   3. Parse product name, supplement facts table, images, form hint, category, directions, certifications
 *   4. Write raw JSON to night-shift/logs/supplement-sprint/orzax-raw/<slug>.json
 *
 * Output written to night-shift/logs/supplement-sprint/orzax-raw/ (one JSON per product)
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/scan-orzax-site.ts [--limit N] [--only=<slug>]
 *
 * Env: none required (static HTML fetch with UA spoof)
 */
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const OUT_DIR = path.resolve(
  __dirname,
  '../../../../../night-shift/logs/supplement-sprint/orzax-raw',
);
const SITEMAP_URL = 'https://www.orzax.com.tr/product-sitemap.xml';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xml,application/xhtml+xml,*/*',
      'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.5',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

async function getProductUrls(): Promise<string[]> {
  const xml = await fetchText(SITEMAP_URL);
  const urls: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const u = m[1].trim();
    // Skip the catalog page itself
    if (/orzax\.com\.tr\/[^/]+\/?$/.test(u) && !u.endsWith('/urunlerimiz/')) {
      urls.push(u);
    }
  }
  return Array.from(new Set(urls));
}

function slugFromUrl(url: string): string {
  const m = url.match(/orzax\.com\.tr\/([^/]+)\/?$/);
  return m ? m[1] : url.replace(/[^a-z0-9]/gi, '-');
}

function stripSize(imgUrl: string): string {
  // Orzax: /wp-content/uploads/2026/04/Ocean_Bisglisinat-600x600.webp
  // Strip -600x600 to get original higher-res
  return imgUrl.replace(/-\d{2,4}x\d{2,4}(?=\.[a-z]+$)/i, '');
}

interface OrzaxRawProduct {
  source_url: string;
  product_slug_orzax: string;
  raw_title: string;
  description_paragraphs: string[];
  supplement_facts_rows: Array<{
    ingredient: string;
    amount: string;
    dv_percent: string | null;
  }>;
  serving_hint: string | null;
  form_hint: string | null;
  net_content_hint: string | null;
  directions: string | null;
  warnings: string | null;
  storage: string | null;
  images: string[];
  category_series: string | null;
  certifications: string[];
  price: string | null;
  barcode_gtin: string | null;
  raw_html_facts_section: string | null;
  scraped_at: string;
}

function parseProductHtml(html: string, url: string): OrzaxRawProduct {
  const $ = cheerio.load(html);

  const title =
    $('h1.product_title').first().text().trim() ||
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    '';

  // Description — first <div class="woocommerce-product-details__short-description"> OR product description tab
  const shortDesc = $(
    '.woocommerce-product-details__short-description, .product-short-description, .short_description',
  )
    .text()
    .trim();
  const longDesc = $('#tab-description, .woocommerce-Tabs-panel--description')
    .text()
    .replace(/\s+/g, ' ')
    .trim();
  const descParas: string[] = [];
  if (shortDesc) descParas.push(shortDesc);
  // Split long description into paragraphs
  $('#tab-description p, .woocommerce-Tabs-panel--description p').each((_, el) => {
    const t = $(el).text().trim();
    if (t) descParas.push(t);
  });

  // Supplement facts — look for a table with "İçerik"/"Miktar" columns or similar
  const factsRows: Array<{ ingredient: string; amount: string; dv_percent: string | null }> = [];
  let rawFactsHtml: string | null = null;

  $('table').each((_, tbl) => {
    const $tbl = $(tbl);
    const text = $tbl.text().toLowerCase();
    if (
      text.includes('içerik') ||
      text.includes('etken') ||
      text.includes('miktar') ||
      text.includes('%brd') ||
      text.includes('beslenme referans') ||
      text.includes('rdl') ||
      /\bmg\b|\bmcg\b|\biu\b|\bμg\b/.test(text)
    ) {
      rawFactsHtml = $tbl.toString();
      $tbl.find('tr').each((_, tr) => {
        const tds = $(tr)
          .find('td,th')
          .map((__, c) => $(c).text().replace(/\s+/g, ' ').trim())
          .get();
        if (tds.length >= 2) {
          // skip header-like rows
          const joined = tds.join(' ').toLowerCase();
          if (joined.includes('içerik') && joined.includes('miktar')) return;
          if (joined.match(/^[a-zöüığşç\s]+$/i) && !tds.some((t) => /[0-9]/.test(t))) return;
          factsRows.push({
            ingredient: tds[0],
            amount: tds[1] || '',
            dv_percent: tds[2] || null,
          });
        }
      });
    }
  });

  // Serving / form / net content hints
  const bodyText = $('body').text().replace(/\s+/g, ' ');
  const servingHint =
    bodyText.match(/porsiyon[^.]{0,40}/i)?.[0] ||
    bodyText.match(/bir\s+(?:tablet|kapsül|softjel|yumuşak jel)[^.]{0,40}/i)?.[0] ||
    null;

  let form: string | null = null;
  const formRe = /\b(tablet|kapsül|kapsul|softjel|yumuşak jel|sprey|damla|şurup|surup|saşe|sase|toz|jel|gummy|likit|liquid)\b/i;
  const formMatch = bodyText.match(formRe);
  if (formMatch) form = formMatch[0].toLowerCase();
  if (!form && title) {
    const tM = title.match(formRe);
    if (tM) form = tM[0].toLowerCase();
  }

  // Net content (e.g. "30 tablet", "150 ml", "60 kapsül", "30 saşe")
  const netMatch = bodyText.match(
    /\b(\d{1,3})\s*(tablet|kapsül|kapsul|softjel|saşe|sase|ml|gummy|damla|sprey)\b/i,
  );
  const netContent = netMatch ? `${netMatch[1]} ${netMatch[2]}` : null;

  // Directions, warnings, storage
  const directions =
    bodyText.match(/Kullanım Şekli[:\s]([^.!?]{10,400})/i)?.[1]?.trim() ||
    bodyText.match(/Tavsiye edilen[^.]{0,250}/i)?.[0]?.trim() ||
    null;
  const warnings =
    bodyText.match(/Uyarı(?:lar)?[:\s]([^.!?]{10,400})/i)?.[1]?.trim() ||
    bodyText.match(/Hamile[^.]{0,250}/i)?.[0]?.trim() ||
    null;
  const storage =
    bodyText.match(/Saklama[^.]{0,200}/i)?.[0]?.trim() ||
    bodyText.match(/Muhafaza[^.]{0,200}/i)?.[0]?.trim() ||
    null;

  // Images — gallery
  const images: string[] = [];
  $(
    '.woocommerce-product-gallery img, .product-image img, .product-gallery img, .flex-control-nav img',
  ).each((_, el) => {
    const src =
      $(el).attr('data-large_image') ||
      $(el).attr('data-src') ||
      $(el).attr('data-zoom-image') ||
      $(el).attr('src');
    if (src && /\.(jpg|jpeg|png|webp)(?:\?|$)/i.test(src)) {
      const clean = stripSize(src.split('?')[0]);
      if (!images.includes(clean)) images.push(clean);
    }
  });
  // og:image fallback
  const og = $('meta[property="og:image"]').attr('content');
  if (og && !images.some((i) => i.includes(path.basename(og, path.extname(og)).replace(/-\d+x\d+$/, '')))) {
    images.push(stripSize(og));
  }

  // Category / series (breadcrumb)
  const series =
    $('.woocommerce-breadcrumb a').last().text().trim() ||
    $('nav.breadcrumb, .breadcrumb').text().replace(/\s+/g, ' ').trim() ||
    null;

  // Certifications — look for badge text or icons near the product info
  const certs: string[] = [];
  const certWords = [
    'gluten',
    'glüten',
    'koruyucu',
    'tatlandırıcı',
    'gmp',
    'iso',
    'haccp',
    'halal',
    'vegan',
    'vejetaryen',
  ];
  const certText = bodyText.toLowerCase();
  for (const w of certWords) {
    const r = new RegExp(`(?:${w})\\s+(?:i(?:ç|c)ermez|compliant|sertifikal?)`, 'i');
    if (r.test(bodyText)) certs.push(w);
  }

  // Price
  const price =
    $('.woocommerce-Price-amount').first().text().replace(/\s+/g, ' ').trim() ||
    $('.price .amount').first().text().replace(/\s+/g, ' ').trim() ||
    null;

  // Barcode / GTIN
  const gtin =
    bodyText.match(/\b(barkod|barcode|gtin|ean)[:\s]+(\d{8,14})/i)?.[2] || null;

  return {
    source_url: url,
    product_slug_orzax: slugFromUrl(url),
    raw_title: title,
    description_paragraphs: descParas,
    supplement_facts_rows: factsRows,
    serving_hint: servingHint,
    form_hint: form,
    net_content_hint: netContent,
    directions,
    warnings,
    storage,
    images,
    category_series: series,
    certifications: certs,
    price,
    barcode_gtin: gtin,
    raw_html_facts_section: rawFactsHtml,
    scraped_at: new Date().toISOString(),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const onlyArg = args.find((a) => a.startsWith('--only='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0;
  const only = onlyArg ? onlyArg.split('=')[1] : null;

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`[scan-orzax] Fetching sitemap: ${SITEMAP_URL}`);
  let urls = await getProductUrls();
  console.log(`[scan-orzax] Found ${urls.length} product URLs`);

  if (only) {
    urls = urls.filter((u) => u.includes(only));
    console.log(`[scan-orzax] Filtered to ${urls.length} by --only=${only}`);
  }
  if (limit > 0) urls = urls.slice(0, limit);

  let success = 0;
  let failed = 0;
  const failures: Array<{ url: string; err: string }> = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const slug = slugFromUrl(url);
    const outPath = path.join(OUT_DIR, `${slug}.json`);
    if (fs.existsSync(outPath)) {
      console.log(`  [${i + 1}/${urls.length}] SKIP (exists): ${slug}`);
      success++;
      continue;
    }
    try {
      console.log(`  [${i + 1}/${urls.length}] FETCH: ${slug}`);
      const html = await fetchText(url);
      const parsed = parseProductHtml(html, url);
      fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
      success++;
      await sleep(DELAY_MS);
    } catch (e: any) {
      failed++;
      failures.push({ url, err: String(e?.message).slice(0, 200) });
      console.log(`  [${i + 1}/${urls.length}] FAIL: ${slug} — ${e?.message}`);
      await sleep(DELAY_MS);
    }
  }

  const summary = {
    total_urls: urls.length,
    success,
    failed,
    failures,
    output_dir: OUT_DIR,
    finished_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(OUT_DIR, '_summary.json'), JSON.stringify(summary, null, 2));

  console.log('');
  console.log(`[scan-orzax] DONE: ${success} success, ${failed} failed`);
  console.log(`[scan-orzax] Output: ${OUT_DIR}`);
}

main().catch((e) => {
  console.error('[scan-orzax] FATAL:', e);
  process.exit(1);
});
