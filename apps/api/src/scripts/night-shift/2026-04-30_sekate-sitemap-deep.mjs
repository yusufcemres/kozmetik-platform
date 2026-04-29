// Sekate nested sitemap recursive fetch
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; REVELA-bot/1.0)' },
  });
  return await res.text();
}

function extractLocs(xml) {
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
  return Array.from(matches, m => m[1]);
}

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Tüm sitemap'leri tara, ürün URL'lerini topla
const startUrls = [
  'https://www.sekate.com.tr/sitemap_index.xml',
];

const visited = new Set();
const productUrls = new Set();

async function crawl(url) {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const xml = await fetchUrl(url);
    const locs = extractLocs(xml);

    for (const loc of locs) {
      // Eğer alt-sitemap ise (xml uzantılı), recursive et
      if (loc.endsWith('.xml')) {
        await crawl(loc);
      }
      // Eğer ürün URL'i ise (Sekate'de ürün URL formatı: /xxx-yyy-zzz)
      // Sekate ürün URL'leri: https://www.sekate.com.tr/[product-slug]
      else if (loc.match(/sekate\.com\.tr\/[a-z0-9-]+\/?$/) && !loc.match(/\/(category|sayfa|page)\//)) {
        productUrls.add(loc);
      }
    }
  } catch (e) {
    console.log(`Error fetching ${url}: ${e.message}`);
  }
}

for (const u of startUrls) await crawl(u);

console.log(`Sitemap crawl ettik: ${visited.size} sitemap`);
console.log(`Bulunan ürün URL: ${productUrls.size}`);

// DB'de Sekate'li slug'lar
const dbProducts = await c.query(`
  SELECT DISTINCT p.product_slug, p.product_name, p.product_id
  FROM products p
  JOIN affiliate_links al ON al.product_id = p.product_id
  WHERE al.platform = 'sekate'
`);
const dbSlugSet = new Set(dbProducts.rows.map(r => r.product_slug.toLowerCase()));

// URL'lerden slug çıkar
const urlSlugs = new Map(); // slug → fullUrl
for (const u of productUrls) {
  const m = u.match(/sekate\.com\.tr\/([a-z0-9-]+)/);
  if (m) {
    const slug = m[1].toLowerCase();
    if (!urlSlugs.has(slug)) urlSlugs.set(slug, u);
  }
}

// Eksik ürünler (DB'de yok)
const missing = [];
for (const [slug, url] of urlSlugs.entries()) {
  if (!dbSlugSet.has(slug)) {
    missing.push({ slug, url });
  }
}

console.log(`\nDB'de Sekate'li (mevcut): ${dbProducts.rows.length}`);
console.log(`Sitemap'te ürün (toplam): ${urlSlugs.size}`);
console.log(`Sitemap'te ama DB'de yok: ${missing.length}`);
console.log('\nİlk 40 eksik ürün:');
for (const m of missing.slice(0, 40)) console.log(`  ${m.slug}`);

// Yazıp dışa aktar (Faz 2 ingest için)
import { writeFileSync } from 'fs';
const outPath = resolve(__dirname, '_sekate_missing_products.json');
writeFileSync(outPath, JSON.stringify(missing, null, 2));
console.log(`\nDışa aktarıldı: ${outPath}`);

await c.end();
