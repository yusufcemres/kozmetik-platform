import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const queries = {
  cosmetic_published: `SELECT COUNT(*) FROM products WHERE domain_type='cosmetic' AND status IN ('published','active')`,
  supplement_published: `SELECT COUNT(*) FROM products WHERE domain_type='supplement' AND status IN ('published','active')`,
  ingredients_total: `SELECT COUNT(*) FROM ingredients`,
  brands_active: `SELECT COUNT(*) FROM brands WHERE EXISTS (SELECT 1 FROM products p WHERE p.brand_id = brands.brand_id AND p.status IN ('published','active'))`,
  brands_with_desc: `SELECT COUNT(*) FROM brands WHERE brand_description IS NOT NULL AND brand_description != ''`,
  needs_total: `SELECT COUNT(*) FROM needs`,
  needs_full_enriched: `SELECT COUNT(*) FROM needs WHERE faq_json IS NOT NULL AND skin_type_affinity IS NOT NULL`,
  articles_published: `SELECT COUNT(*) FROM articles WHERE status='published'`,
  affiliate_links: `SELECT COUNT(*) FROM affiliate_links`,
  product_scores: `SELECT COUNT(*) FROM product_scores`,
  inci_with_common_name: `SELECT COUNT(*) FROM ingredients WHERE common_name IS NOT NULL AND common_name != ''`,
  inci_with_detail: `SELECT COUNT(*) FROM ingredients WHERE detailed_description IS NOT NULL AND detailed_description != ''`,
  inci_with_evidence: `SELECT COUNT(*) FROM ingredients WHERE evidence_grade IS NOT NULL`,
};

const results = {};
for (const [k, q] of Object.entries(queries)) {
  try {
    const r = await c.query(q);
    results[k] = parseInt(r.rows[0].count, 10);
  } catch (e) {
    results[k] = `ERR: ${e.message.slice(0, 50)}`;
  }
}

console.log('## REVELA Gerçek Veritabanı (2026-04-30 00:30)');
console.log(JSON.stringify(results, null, 2));

await c.end();
