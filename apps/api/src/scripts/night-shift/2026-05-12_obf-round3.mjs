/**
 * FAZ 12 — OBF Round 3: 40 ek marka.
 * Mass-market + premium + Korean beauty + makeup focus.
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = './tmp/obf-results';
const USER_AGENT = 'REVELA/1.0 (https://kozmetik-platform.vercel.app)';

const BRANDS = [
  // Korean Beauty
  { slug: 'innisfree', search: 'innisfree' },
  { slug: 'laneige', search: 'laneige' },
  { slug: 'sulwhasoo', search: 'sulwhasoo' },
  { slug: 'tony-moly', search: 'tony-moly' },
  { slug: 'etude-house', search: 'etude-house' },
  { slug: 'banila-co', search: 'banila-co' },
  { slug: 'missha', search: 'missha' },
  { slug: 'dr-jart', search: 'dr-jart' },
  { slug: 'belif', search: 'belif' },
  { slug: 'farmacy', search: 'farmacy' },
  // Western premium
  { slug: 'clinique', search: 'clinique' },
  { slug: 'lancome', search: 'lancome' },
  { slug: 'estee-lauder', search: 'estee-lauder' },
  { slug: 'clarins', search: 'clarins' },
  { slug: 'shiseido', search: 'shiseido' },
  { slug: 'kiehls', search: 'kiehl-s' },
  { slug: 'origins', search: 'origins' },
  { slug: 'sk-ii', search: 'sk-ii' },
  // Mass-market global
  { slug: 'garnier', search: 'garnier' },
  { slug: 'olay', search: 'olay' },
  { slug: 'neutrogena', search: 'neutrogena' },
  { slug: 'aveeno', search: 'aveeno' },
  { slug: 'maybelline', search: 'maybelline' },
  { slug: 'pantene', search: 'pantene' },
  { slug: 'head-shoulders', search: 'head-shoulders' },
  { slug: 'dove', search: 'dove' },
  { slug: 'rexona', search: 'rexona' },
  { slug: 'palmolive', search: 'palmolive' },
  { slug: 'colgate', search: 'colgate' },
  { slug: 'oral-b', search: 'oral-b' },
  { slug: 'sensodyne', search: 'sensodyne' },
  { slug: 'parodontax', search: 'parodontax' },
  // TR yerli
  { slug: 'farmasi', search: 'farmasi' },
  { slug: 'flormar', search: 'flormar' },
  { slug: 'golden-rose', search: 'golden-rose' },
  { slug: 'pastel', search: 'pastel' },
  { slug: 'rosense', search: 'rosense' },
  { slug: 'arko', search: 'arko' },
  { slug: 'duru', search: 'duru' },
  { slug: 'evyap', search: 'evyap' },
];

async function fetchBrandPage(brandSlug, page = 1) {
  const url = `https://world.openbeautyfacts.org/brand/${brandSlug}.json?page_size=50&page=${page}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`OBF ${res.status}`);
  return res.json();
}

async function fetchBrandAll(slug) {
  const all = [];
  let page = 1, total = 0;
  while (true) {
    try {
      const data = await fetchBrandPage(slug, page);
      const products = data.products || [];
      if (!products.length) break;
      total = data.count || 0;
      all.push(...products);
      if (all.length >= total || page >= 5) break;
      page++;
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) { console.error(`  page ${page} fail: ${e.message}`); break; }
  }
  return { count: total, products: all };
}

function parseProduct(p) {
  const inciRaw = p.ingredients_text_en || p.ingredients_text || p.ingredients_text_tr || '';
  const inciTokens = inciRaw.replace(/[\(\[].*?[\)\]]/g, '').split(/[,;\.\n]+/)
    .map((s) => s.trim().replace(/^["'`]+|["'`]+$/g, ''))
    .filter((s) => s.length > 1 && s.length < 100).slice(0, 80);
  return {
    barcode: p.code || p._id,
    product_name: p.product_name || p.product_name_en || null,
    brand_name: (p.brands || '').split(',')[0]?.trim() || null,
    image_url: p.image_front_url || p.image_url || null,
    ingredients_raw: inciRaw || null,
    ingredients_list: inciTokens,
    net_content: p.quantity || null,
    completeness: Number(p.completeness) || 0,
  };
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`=== OBF Round 3 — ${BRANDS.length} markalar ===\n`);
  const summary = [];
  for (const brand of BRANDS) {
    console.log(`[${brand.slug}] fetching...`);
    try {
      const result = await fetchBrandAll(brand.search);
      const parsed = result.products.map(parseProduct).filter((p) => p.barcode);
      const withInci = parsed.filter((p) => p.ingredients_list.length > 0);
      await writeFile(join(OUTPUT_DIR, `${brand.slug}.json`), JSON.stringify({
        brand_slug: brand.slug, fetched_at: new Date().toISOString(),
        total_obf_count: result.count, parsed_count: parsed.length, with_inci: withInci.length,
        products: parsed,
      }, null, 2), 'utf-8');
      console.log(`  ✓ ${brand.slug}: ${parsed.length} (${withInci.length} INCI'li), OBF total ${result.count}`);
      summary.push({ brand: brand.slug, parsed: parsed.length, with_inci: withInci.length });
    } catch (e) {
      console.error(`  ✗ ${brand.slug}: ${e.message}`);
      summary.push({ brand: brand.slug, parsed: 0, error: e.message });
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  await writeFile(join(OUTPUT_DIR, '_round3_summary.json'), JSON.stringify(summary, null, 2), 'utf-8');
  const tp = summary.reduce((s, b) => s + (b.parsed || 0), 0);
  const ti = summary.reduce((s, b) => s + (b.with_inci || 0), 0);
  console.log(`\n=== Round 3: ${tp} parsed, ${ti} INCI'li ===`);
}
main().catch((e) => { console.error(e); process.exit(1); });
