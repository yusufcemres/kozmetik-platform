/**
 * Gece vardiyasi FAZ 6 — OBF Round 2: 20+ ek marka.
 * Round 1: KOREACO, EST, Dalin, Krijen, Siveno, AGIVA, BABOON, Nivea, LRP, Bioderma, CeraVe, Eucerin, Isana
 * Round 2: Avene, Caudalie, Vichy, NUXE, Mustela, Cetaphil, Bepanthen, Sebamed, A-Derma, SVR, Filorga,
 *          Embryolisse, Lierac, Klorane, Galenic, Phyto, Bioderma Atoderm, Roc, Vanicream, Klorane, COSRX, Beauty of Joseon
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = './tmp/obf-results';
const USER_AGENT = 'REVELA/1.0 (https://kozmetik-platform.vercel.app/contact)';

const BRANDS = [
  { slug: 'avene', search: 'avene' },
  { slug: 'caudalie', search: 'caudalie' },
  { slug: 'vichy', search: 'vichy' },
  { slug: 'nuxe', search: 'nuxe' },
  { slug: 'mustela', search: 'mustela' },
  { slug: 'cetaphil', search: 'cetaphil' },
  { slug: 'bepanthen', search: 'bepanthen' },
  { slug: 'sebamed', search: 'sebamed' },
  { slug: 'a-derma', search: 'a-derma' },
  { slug: 'svr', search: 'svr' },
  { slug: 'filorga', search: 'filorga' },
  { slug: 'embryolisse', search: 'embryolisse' },
  { slug: 'lierac', search: 'lierac' },
  { slug: 'klorane', search: 'klorane' },
  { slug: 'galenic', search: 'galenic' },
  { slug: 'phyto', search: 'phyto' },
  { slug: 'roc', search: 'roc' },
  { slug: 'beauty-of-joseon', search: 'beauty-of-joseon' },
  { slug: 'pixi', search: 'pixi' },
  { slug: 'paula-s-choice', search: 'paula-s-choice' },
  { slug: 'inkey-list', search: 'the-inkey-list' },
  { slug: 'mediheal', search: 'mediheal' },
  { slug: 'numbuzin', search: 'numbuzin' },
  { slug: 'anua', search: 'anua' },
  { slug: 'isntree', search: 'isntree' },
  { slug: 'klairs', search: 'klairs' },
  { slug: 'pyunkang-yul', search: 'pyunkang-yul' },
  { slug: 'some-by-mi', search: 'some-by-mi' },
  { slug: 'kerastase', search: 'kerastase' },
  { slug: 'loreal-paris', search: 'l-oreal-paris' },
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
      if (allProducts.length >= totalCount || page >= 5) break;
      page++;
      await new Promise((r) => setTimeout(r, 1500));
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
    completeness: Number(p.completeness) || 0,
  };
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`=== OBF Round 2 — ${BRANDS.length} markalar ===\n`);
  const summary = [];

  for (const brand of BRANDS) {
    console.log(`[${brand.slug}] fetching...`);
    try {
      const result = await fetchBrandAll(brand.search);
      const parsed = result.products.map(parseProduct).filter((p) => p.barcode);
      const withInci = parsed.filter((p) => p.ingredients_list.length > 0);
      await writeFile(join(OUTPUT_DIR, `${brand.slug}.json`), JSON.stringify({
        brand_slug: brand.slug, search_query: brand.search,
        fetched_at: new Date().toISOString(),
        total_obf_count: result.count, parsed_count: parsed.length, with_inci: withInci.length,
        products: parsed,
      }, null, 2), 'utf-8');
      console.log(`  ✓ ${brand.slug}: ${parsed.length} parsed (${withInci.length} INCI'li), total OBF ${result.count}`);
      summary.push({ brand: brand.slug, parsed: parsed.length, with_inci: withInci.length });
    } catch (e) {
      console.error(`  ✗ ${brand.slug}: ${e.message}`);
      summary.push({ brand: brand.slug, parsed: 0, error: e.message });
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  await writeFile(join(OUTPUT_DIR, '_round2_summary.json'), JSON.stringify(summary, null, 2), 'utf-8');
  const totalParsed = summary.reduce((s, b) => s + (b.parsed || 0), 0);
  const totalInci = summary.reduce((s, b) => s + (b.with_inci || 0), 0);
  console.log(`\n=== Round 2 Stats ===\nTotal: ${totalParsed} parsed, ${totalInci} INCI'li`);
}

main().catch((e) => { console.error(e); process.exit(1); });
