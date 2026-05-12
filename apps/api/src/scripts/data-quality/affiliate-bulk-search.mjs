/**
 * 853 canli urunden affiliate link yoksa Tavily ile Trendyol/HB ara.
 * - site:trendyol.com {brand} {urun}
 * - bulamazsa site:hepsiburada.com {brand} {urun}
 * - URL pattern dogrula, kaydet
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const TAVILY_KEY = process.env.TAVILY_API_KEY;
if (!TAVILY_KEY) { console.error('TAVILY_API_KEY required'); process.exit(1); }
const TAVILY_API = 'https://api.tavily.com/search';

const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '900');
const PARALLEL = 3;

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function searchAffiliate(brand, name) {
  const queries = [
    `site:trendyol.com ${brand || ''} ${name}`.trim(),
    `site:hepsiburada.com ${brand || ''} ${name}`.trim(),
  ];
  for (const q of queries) {
    try {
      const res = await fetch(TAVILY_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TAVILY_KEY}` },
        body: JSON.stringify({ query: q, max_results: 5, search_depth: 'basic' }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const r of data.results || []) {
        const u = r.url || '';
        if (/trendyol\.com\/[^/]+\/[^?]+-p-\d+/.test(u)) {
          return { platform: 'trendyol', url: u.split('?')[0] };
        }
        if (/hepsiburada\.com\/[^?]+-p-HB[A-Z0-9]+/.test(u)) {
          return { platform: 'hepsiburada', url: u.split('?')[0] };
        }
      }
    } catch (e) { /* continue */ }
    await sleep(300);
  }
  return null;
}

await client.connect();

const { rows: targets } = await client.query(`
  SELECT p.product_id, p.product_name, b.brand_name
  FROM products p LEFT JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.status IN ('published','active')
    AND NOT EXISTS (SELECT 1 FROM affiliate_links al WHERE al.product_id=p.product_id)
  ORDER BY p.product_id DESC
  LIMIT $1
`, [LIMIT]);
console.log(`Affiliate search targets: ${targets.length}\n`);

let found = 0, not_found = 0;
for (let i = 0; i < targets.length; i += PARALLEL) {
  const chunk = targets.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (p) => {
    const link = await searchAffiliate(p.brand_name || '', p.product_name);
    if (!link) return { id: p.product_id, name: p.product_name, found: false };
    await client.query(
      `INSERT INTO affiliate_links (product_id, platform, affiliate_url, is_active, verification_status, created_at, updated_at)
       VALUES ($1, $2, $3, true, 'unverified', NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [p.product_id, link.platform, link.url],
    );
    return { id: p.product_id, name: p.product_name, found: true, platform: link.platform };
  }));
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.found) {
      found++;
      if (found % 20 === 0) console.log(`  [+${i}] ${found} found / ${not_found} not — last: ${r.value.platform} for #${r.value.id} ${r.value.name?.slice(0,40)}`);
    } else if (r.status === 'fulfilled') {
      not_found++;
    } else {
      not_found++;
    }
  }
  await sleep(100);
}

console.log(`\n=== Done: ${found} affiliates added, ${not_found} not found ===`);
await client.end();
