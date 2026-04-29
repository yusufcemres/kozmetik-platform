/**
 * Hayalet ürünleri arşivle: image:0 + alt:'' + affiliate:0 + insert tarihi 2026-04-25
 * (genelde AI/LLM tarafından üretilmiş, gerçekte üreticinin kataloğunda olmayan)
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Geniş audit: tüm DB'de aynı pattern (2026-04-25 + img=0 + alt='' + aff=0 + supplement)
const ghosts = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, p.status, p.created_at, b.brand_slug, b.brand_name,
    (SELECT COUNT(*) FROM product_images i WHERE i.product_id=p.product_id) AS img,
    (SELECT i.alt_text FROM product_images i WHERE i.product_id=p.product_id LIMIT 1) AS alt,
    (SELECT COUNT(*) FROM affiliate_links al WHERE al.product_id=p.product_id) AS aff
  FROM products p
  JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.domain_type='supplement' AND p.status='published'
    AND DATE(p.created_at) = '2026-04-25'
    AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.product_id)
    AND NOT EXISTS (SELECT 1 FROM affiliate_links al WHERE al.product_id=p.product_id AND al.is_active=true)
  ORDER BY b.brand_slug, p.product_slug
`);
console.log(`Hayalet aday (geniş audit): ${ghosts.rowCount}`);

const byBrand = {};
for (const g of ghosts.rows) byBrand[g.brand_name] = (byBrand[g.brand_name] || 0) + 1;
console.log('\n## Markaya göre hayalet:');
for (const [k,v] of Object.entries(byBrand).sort((a,b) => b[1]-a[1])) console.log(`  ${v.toString().padStart(3)} | ${k}`);

console.log('\n## İlk 30 örnek:');
for (const g of ghosts.rows.slice(0, 30)) {
  console.log(`  [${g.product_id}] ${g.brand_name.slice(0,12).padEnd(12)} | ${g.product_slug.slice(0,55)}`);
}

// Arşivle
const ids = ghosts.rows.map(g => g.product_id);
const upd = await c.query(`
  UPDATE products SET status='archived', updated_at=NOW()
  WHERE product_id = ANY($1::int[])
  RETURNING product_id
`, [ids]);
console.log(`\n[ARŞİVLENDİ] ${upd.rowCount} ürün → status='archived'`);

// Doğrulama
const after = await c.query(`SELECT COUNT(*) FILTER (WHERE status='published') AS pub, COUNT(*) FILTER (WHERE status='archived') AS arch FROM products WHERE domain_type='supplement'`);
console.log(`Total supplement: published ${after.rows[0].pub}, archived ${after.rows[0].arch}`);

// Markdown rapor
const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_ghost-archive.md');
let md = `# Hayalet Ürün Arşivleme — 2026-04-29\n\n`;
md += `**Arşivlenen ürün:** ${upd.rowCount}\n\n`;
md += `## Kriter\n- domain_type=supplement\n- status=published\n- created_at=2026-04-25\n- image_count=0 + alt_text boş\n- affiliate_count=0\n\n`;
md += `## Marka dağılımı\n\n| Marka | Sayı |\n|-------|------|\n`;
for (const [k,v] of Object.entries(byBrand)) md += `| ${k} | ${v} |\n`;
md += `\n## Arşivlenen ürün listesi\n\n| ID | Brand | Slug | Created |\n|----|-------|------|---------|\n`;
for (const g of ghosts.rows) md += `| ${g.product_id} | ${g.brand_name} | ${g.product_slug} | ${new Date(g.created_at).toISOString().slice(0,10)} |\n`;
md += `\n## Geri alma\nReversible — \`UPDATE products SET status='published' WHERE product_id IN (${ids.slice(0,5).join(',')}, ...);\`\n`;
writeFileSync(reportPath, md);
console.log(`Rapor: ${reportPath}`);

await c.end();
