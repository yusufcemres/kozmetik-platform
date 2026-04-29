// Sekate sitemap çek + DB ile karşılaştır → eksik ürün listesi
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

async function fetchSitemap(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; REVELA-bot/1.0)' } });
  return await res.text();
}

const SITEMAP_URLS = [
  'https://sekate.com.tr/sitemap.xml',
  'https://sekate.com.tr/sitemap_products.xml',
  'https://sekate.com.tr/sitemap_index.xml',
];

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let allUrls = [];
for (const url of SITEMAP_URLS) {
  try {
    const xml = await fetchSitemap(url);
    const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
    for (const m of matches) {
      const u = m[1];
      if (u.includes('/urun') || u.includes('/product') || u.includes('-takviye')) {
        allUrls.push(u);
      }
    }
    console.log(`${url}: bulunan URL ${allUrls.length}`);
  } catch (e) {
    console.log(`${url}: ERROR ${e.message}`);
  }
}

console.log(`\nToplam ürün URL: ${allUrls.length}`);
if (allUrls.length === 0) {
  console.log('Sitemap erişilemedi veya format farklı. Manual scrape gerekebilir.');
  await c.end();
  process.exit(0);
}

// İlk 10 URL örnek
console.log('\nİlk 10 URL örnek:');
for (const u of allUrls.slice(0, 10)) console.log(`  ${u}`);

// URL'lerden slug çıkar (/urun/X-Y-Z formatı)
const slugs = allUrls.map(u => {
  const m = u.match(/\/(?:urun|product|takviye)\/([^/?#]+)/);
  return m ? m[1].toLowerCase() : null;
}).filter(Boolean);

console.log(`\nSlug çıkarılan: ${slugs.length}`);

// DB'de Sekate affiliate'ı olan ürünleri çek
const dbProducts = await c.query(`
  SELECT DISTINCT p.product_slug, p.product_name
  FROM products p
  JOIN affiliate_links al ON al.product_id = p.product_id
  WHERE al.platform = 'sekate'
`);

console.log(`\nDB'de Sekate'li ürün: ${dbProducts.rows.length}`);

// Sitemap'te var ama DB'de yok olanlar
const dbSlugSet = new Set(dbProducts.rows.map(r => r.product_slug));
const missingSlugs = slugs.filter(s => !dbSlugSet.has(s));

console.log(`\nDB'de eksik (Sekate'de var): ${missingSlugs.length}`);
console.log('İlk 30:');
for (const s of missingSlugs.slice(0, 30)) console.log(`  ${s}`);

await c.end();
