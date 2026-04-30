import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const queries = {
  cosmetic_pub: `SELECT COUNT(*) FROM products WHERE domain_type='cosmetic' AND status IN ('published','active')`,
  supp_pub: `SELECT COUNT(*) FROM products WHERE domain_type='supplement' AND status IN ('published','active')`,
  total_pub: `SELECT COUNT(*) FROM products WHERE status IN ('published','active')`,
  with_image: `SELECT COUNT(*) FROM products p WHERE status IN ('published','active') AND EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.product_id)`,
  ingredients_total: `SELECT COUNT(*) FROM ingredients`,
  used_ingredients: `SELECT COUNT(DISTINCT i.ingredient_id) FROM ingredients i JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id JOIN products p ON p.product_id = pi.product_id WHERE p.status IN ('published','active')`,
  used_with_summary: `SELECT COUNT(DISTINCT i.ingredient_id) FROM ingredients i JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id JOIN products p ON p.product_id = pi.product_id WHERE p.status IN ('published','active') AND function_summary IS NOT NULL AND function_summary != ''`,
  used_with_common: `SELECT COUNT(DISTINCT i.ingredient_id) FROM ingredients i JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id JOIN products p ON p.product_id = pi.product_id WHERE p.status IN ('published','active') AND common_name IS NOT NULL AND common_name != ''`,
  used_with_evidence: `SELECT COUNT(DISTINCT i.ingredient_id) FROM ingredients i JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id JOIN products p ON p.product_id = pi.product_id WHERE p.status IN ('published','active') AND evidence_grade IS NOT NULL AND evidence_grade != ''`,
  detail_full: `SELECT COUNT(*) FROM ingredients WHERE LENGTH(detailed_description) >= 1500`,
  detail_partial: `SELECT COUNT(*) FROM ingredients WHERE detailed_description IS NOT NULL AND LENGTH(detailed_description) BETWEEN 300 AND 1499`,
  detail_stub: `SELECT COUNT(*) FROM ingredients WHERE detailed_description IS NOT NULL AND LENGTH(detailed_description) < 300`,
  brand_total: `SELECT COUNT(*) FROM brands WHERE EXISTS (SELECT 1 FROM products p WHERE p.brand_id = brands.brand_id AND p.status IN ('published','active'))`,
  brand_with_logo: `SELECT COUNT(*) FROM brands WHERE logo_url IS NOT NULL AND logo_url != '' AND EXISTS (SELECT 1 FROM products p WHERE p.brand_id = brands.brand_id AND p.status IN ('published','active'))`,
  brand_with_desc: `SELECT COUNT(*) FROM brands WHERE brand_description IS NOT NULL AND brand_description != '' AND EXISTS (SELECT 1 FROM products p WHERE p.brand_id = brands.brand_id AND p.status IN ('published','active'))`,
  needs_total: `SELECT COUNT(*) FROM needs`,
  needs_enriched: `SELECT COUNT(*) FROM needs WHERE faq_json IS NOT NULL AND skin_type_affinity IS NOT NULL`,
  articles_pub: `SELECT COUNT(*) FROM content_articles WHERE status='published'`,
  affiliate_links: `SELECT COUNT(*) FROM affiliate_links`,
  product_scores: `SELECT COUNT(*) FROM product_scores`,
  orphan_pi: `SELECT COUNT(*) FROM product_ingredients WHERE ingredient_id IS NULL`,
  product_score_old: `SELECT COUNT(*) FROM products p WHERE p.status IN ('published','active') AND NOT EXISTS (SELECT 1 FROM product_scores s WHERE s.product_id = p.product_id)`,
};

const r = {};
for (const [k, q] of Object.entries(queries)) {
  try { r[k] = parseInt((await c.query(q)).rows[0].count, 10); }
  catch (e) { r[k] = `ERR: ${e.message.slice(0,40)}`; }
}

console.log('## REVELA Tam Durum (2026-04-30 15:15)\n');
console.log(`Yayın ürün: ${r.total_pub} (${r.cosmetic_pub} kozmetik + ${r.supp_pub} takviye)`);
console.log(`Görsel kapsama: ${r.with_image}/${r.total_pub} (${(100*r.with_image/r.total_pub).toFixed(1)}%)`);
console.log(``);
console.log(`INCI total: ${r.ingredients_total}`);
console.log(`Kullanılan INCI: ${r.used_ingredients}`);
console.log(`  function_summary: ${r.used_with_summary}/${r.used_ingredients} (${(100*r.used_with_summary/r.used_ingredients).toFixed(1)}%)`);
console.log(`  common_name: ${r.used_with_common}/${r.used_ingredients} (${(100*r.used_with_common/r.used_ingredients).toFixed(1)}%)`);
console.log(`  evidence_grade: ${r.used_with_evidence}/${r.used_ingredients} (${(100*r.used_with_evidence/r.used_ingredients).toFixed(1)}%)`);
console.log(``);
console.log(`INCI detail (≥1500 char full): ${r.detail_full}`);
console.log(`INCI detail (300-1499 partial): ${r.detail_partial}`);
console.log(`INCI detail (<300 stub): ${r.detail_stub}`);
console.log(``);
console.log(`Brand aktif: ${r.brand_total}`);
console.log(`  logo: ${r.brand_with_logo}/${r.brand_total}`);
console.log(`  description: ${r.brand_with_desc}/${r.brand_total}`);
console.log(``);
console.log(`Needs: ${r.needs_enriched}/${r.needs_total} enriched`);
console.log(`Articles published: ${r.articles_pub}`);
console.log(`Affiliate links: ${r.affiliate_links}`);
console.log(`Product scores cache: ${r.product_scores}`);
console.log(`Orphan product_ingredients: ${r.orphan_pi}`);
console.log(`Skor cache eksik ürün: ${r.product_score_old}`);

await c.end();
