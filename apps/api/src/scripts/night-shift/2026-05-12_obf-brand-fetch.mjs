/**
 * Gece vardiyasi 2026-05-12 — Yerli marka bulk OBF fetch.
 *
 * Her marka icin OpenBeautyFacts brand search API'sini call eder.
 * Sonuclar: tmp/obf-results/{brand_slug}.json
 *
 * Auto-publish YOK — sadece JSON kaydeder. Sonra merge-obf-to-db.mjs ile DB'ye alinir.
 *
 * Usage: node src/scripts/night-shift/2026-05-12_obf-brand-fetch.mjs
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OUTPUT_DIR = './tmp/obf-results';
const USER_AGENT = 'REVELA/1.0 (https://kozmetik-platform.vercel.app/contact)';

// Priority brand list — OCR'da yakalanan + yerli markalar
const BRANDS = [
  // Tier 1 — OCR yakalanan
  { slug: 'koreaco', search: 'koreaco' },
  { slug: 'eyup-sabri-tuncer', search: 'eyup-sabri-tuncer' },
  { slug: 'dalin', search: 'dalin' },
  { slug: 'dalan', search: 'dalan' },
  { slug: 'siveno', search: 'siveno' },
  { slug: 'krijen', search: 'krijen' },
  // Tier 2 — OCR'da gozuken
  { slug: 'the-humble-co', search: 'the-humble-co' },
  { slug: 'agiva', search: 'agiva' },
  { slug: 'baboon', search: 'baboon-natural' },
  { slug: 'lit-makyaj', search: 'lit-makyaj' },
  { slug: 'licape', search: 'licape' },
  { slug: 'ph-lab', search: 'ph-lab' },
  { slug: 'the-ordinary', search: 'the-ordinary' },
  // Tier 3 — TR niche
  { slug: 'sinoz', search: 'sinoz' },
  { slug: 'procsin', search: 'procsin' },
  { slug: 'the-purest-solutions', search: 'the-purest-solutions' },
  { slug: 'bee-beauty', search: 'bee-beauty' },
  { slug: 'frudia', search: 'frudia' },
  { slug: 'isana', search: 'isana' },
  { slug: 'nivea', search: 'nivea' },
  // Tier 4 — Global ama Türkiye yaygın
  { slug: 'cosrx', search: 'cosrx' },
  { slug: 'cerave', search: 'cerave' },
  { slug: 'la-roche-posay', search: 'la-roche-posay' },
  { slug: 'eucerin', search: 'eucerin' },
  { slug: 'bioderma', search: 'bioderma' },
];

async function fetchBrandPage(brandSlug, page = 1) {
  const url = `https://world.openbeautyfacts.org/brand/${brandSlug}.json?page_size=50&page=${page}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`OBF ${res.status} for ${brandSlug}`);
  return res.json();
}

async function fetchBrandAll(brandSlug) {
  const allProducts = [];
  let page = 1;
  let totalCount = 0;
  while (true) {
    try {
      const data = await fetchBrandPage(brandSlug, page);
      const products = data.products || [];
      if (products.length === 0) break;
      totalCount = data.count || 0;
      allProducts.push(...products);
      if (allProducts.length >= totalCount || page >= 5) break; // max 250 per brand
      page++;
      await new Promise((r) => setTimeout(r, 1500)); // throttle
    } catch (e) {
      console.error(`  page ${page} fail: ${e.message}`);
      break;
    }
  }
  return { count: totalCount, products: allProducts };
}

function parseProduct(p) {
  const inciRaw = p.ingredients_text_en || p.ingredients_text || p.ingredients_text_tr || '';
  const inciTokens = inciRaw
    .replace(/[\(\[].*?[\)\]]/g, '')
    .split(/[,;\.\n]+/)
    .map((s) => s.trim().replace(/^["'`]+|["'`]+$/g, ''))
    .filter((s) => s.length > 1 && s.length < 100)
    .slice(0, 80);
  return {
    barcode: p.code || p._id,
    product_name: p.product_name || p.product_name_en || null,
    brand_name: (p.brands || '').split(',')[0]?.trim() || null,
    brands_all: p.brands,
    image_url: p.image_front_url || p.image_url || null,
    ingredients_raw: inciRaw || null,
    ingredients_list: inciTokens,
    net_content: p.quantity || null,
    countries: p.countries || null,
    categories: p.categories || null,
    labels: p.labels || null,
    completeness: Number(p.completeness) || 0,
    last_modified_t: p.last_modified_t,
  };
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`=== OBF Brand Bulk Fetch — ${BRANDS.length} markalar ===\n`);
  const summary = [];

  for (const brand of BRANDS) {
    console.log(`[${brand.slug}] fetching...`);
    try {
      const result = await fetchBrandAll(brand.search);
      const parsed = result.products.map(parseProduct).filter((p) => p.barcode);
      const withInci = parsed.filter((p) => p.ingredients_list.length > 0);
      const outFile = join(OUTPUT_DIR, `${brand.slug}.json`);
      await writeFile(outFile, JSON.stringify({
        brand_slug: brand.slug,
        search_query: brand.search,
        fetched_at: new Date().toISOString(),
        total_obf_count: result.count,
        parsed_count: parsed.length,
        with_inci: withInci.length,
        products: parsed,
      }, null, 2), 'utf-8');
      console.log(`  ✓ ${brand.slug}: ${parsed.length} parsed (${withInci.length} with INCI), total OBF ${result.count}`);
      summary.push({ brand: brand.slug, parsed: parsed.length, with_inci: withInci.length });
    } catch (e) {
      console.error(`  ✗ ${brand.slug}: ${e.message}`);
      summary.push({ brand: brand.slug, parsed: 0, error: e.message });
    }
    await new Promise((r) => setTimeout(r, 2000)); // brand-arasi throttle
  }

  await writeFile(join(OUTPUT_DIR, '_summary.json'), JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`\n=== Summary ===`);
  const totalParsed = summary.reduce((s, b) => s + (b.parsed || 0), 0);
  const totalWithInci = summary.reduce((s, b) => s + (b.with_inci || 0), 0);
  console.log(`Total parsed products: ${totalParsed}`);
  console.log(`Products with INCI: ${totalWithInci}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
