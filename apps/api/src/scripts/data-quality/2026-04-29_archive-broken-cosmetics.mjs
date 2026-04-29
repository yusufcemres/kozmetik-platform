/**
 * 36 kozmetik (görsel yok/broken) → status='archived'
 * Reversible: kullanıcı görsel eklediğinde published'a geri çevrilir.
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

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0';

// Aynı V2 audit kriteri ile broken kozmetikler
const all = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, b.brand_name,
    (SELECT i.image_url FROM product_images i WHERE i.product_id=p.product_id ORDER BY i.sort_order LIMIT 1) AS url,
    (SELECT COUNT(*) FROM product_images i WHERE i.product_id=p.product_id) AS cnt
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.domain_type='cosmetic' AND p.status='published'
`);

console.log(`Total cosmetic published: ${all.rowCount}`);

const CONCURRENCY = 8;
async function check(item) {
  if (item.cnt === 0) return { ...item, reason: 'no-image-record' };
  const url = item.url || '';
  if (!url || url.trim() === '') return { ...item, reason: 'url-empty' };
  if (!url.startsWith('http')) return { ...item, reason: 'not-http' };
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000), redirect: 'follow' });
      if (r.ok) return null;
      if (r.status === 404 || r.status === 403 || r.status === 400) return { ...item, reason: `http-${r.status}` };
      if (attempt === 2) return { ...item, reason: `http-${r.status}` };
    } catch {
      if (attempt === 2) return { ...item, reason: 'timeout-network' };
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

const failed = [];
let processed = 0;
async function worker(items) {
  for (const item of items) {
    const result = await check(item);
    if (result) failed.push(result);
    processed++;
    if (processed % 200 === 0) console.log(`  [${processed}/${all.rowCount}] failed: ${failed.length}`);
  }
}

const chunks = [];
for (let i = 0; i < CONCURRENCY; i++) chunks.push([]);
all.rows.forEach((r, i) => chunks[i % CONCURRENCY].push(r));
await Promise.all(chunks.map(worker));

console.log(`\nArşivlenecek: ${failed.length}`);
const ids = failed.map(f => f.product_id);

if (ids.length === 0) { console.log('İşlenecek ürün yok'); await c.end(); process.exit(0); }

// Markaya göre
const byBrand = {};
for (const f of failed) byBrand[f.brand_name] = (byBrand[f.brand_name] || 0) + 1;
console.log('\n## Markaya göre:');
for (const [k,v] of Object.entries(byBrand).sort((a,b) => b[1]-a[1])) console.log(`  ${v.toString().padStart(2)} | ${k}`);

// Arşivle
const upd = await c.query(`UPDATE products SET status='archived', updated_at=NOW() WHERE product_id = ANY($1::int[]) RETURNING product_id`, [ids]);
console.log(`\n[ARŞİVLENDİ] ${upd.rowCount} kozmetik → status='archived'`);

// Final
const after = await c.query(`SELECT COUNT(*) FILTER (WHERE status='published') AS pub, COUNT(*) FILTER (WHERE status='archived') AS arch FROM products WHERE domain_type='cosmetic'`);
console.log(`Total cosmetic: published ${after.rows[0].pub}, archived ${after.rows[0].arch}`);

// Markdown rapor
const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_broken-cosmetic-archive.md');
let md = `# Görseli Bozuk Kozmetik Arşivleme — 2026-04-29\n\n`;
md += `**Arşivlenen:** ${upd.rowCount}\n\n`;
md += `## Marka dağılımı\n\n| Marka | Sayı |\n|-------|------|\n`;
for (const [k,v] of Object.entries(byBrand).sort((a,b) => b[1]-a[1])) md += `| ${k} | ${v} |\n`;
md += `\n## Liste\n\n| ID | Marka | Slug | Sebep |\n|----|-------|------|-------|\n`;
for (const f of failed) md += `| ${f.product_id} | ${f.brand_name} | ${f.product_slug} | ${f.reason} |\n`;
md += `\n## Geri alma\n\`\`\`sql\nUPDATE products SET status='published' WHERE product_id IN (${ids.join(',')});\n\`\`\`\n`;
writeFileSync(reportPath, md);
console.log(`Rapor: ${reportPath}`);

await c.end();
