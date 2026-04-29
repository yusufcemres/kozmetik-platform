/**
 * Tüm kozmetik image URL'lerine paralel HEAD testi.
 * Broken (404/timeout/network) olanları liste.
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

const r = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, b.brand_name,
    (SELECT i.image_url FROM product_images i WHERE i.product_id=p.product_id ORDER BY i.sort_order LIMIT 1) AS url,
    (SELECT COUNT(*) FROM product_images i WHERE i.product_id=p.product_id) AS cnt
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.domain_type='cosmetic' AND p.status='published'
  ORDER BY b.brand_name, p.product_name
`);

console.log(`Total: ${r.rowCount}`);

// Paralel HEAD test (10 concurrent)
const CONCURRENCY = 12;
async function checkUrl(item) {
  const url = item.url || '';
  if (!url || url.trim() === '') return { ...item, reason: 'empty' };
  if (!url.startsWith('http')) return { ...item, reason: 'not-http' };
  try {
    const resp = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(6000), redirect: 'follow' });
    if (resp.ok) return null;
    return { ...item, reason: `HTTP ${resp.status}` };
  } catch (e) {
    return { ...item, reason: 'timeout/network' };
  }
}

const failed = [];
let processed = 0;
async function worker(items) {
  for (const item of items) {
    const result = await checkUrl(item);
    if (result) failed.push(result);
    processed++;
    if (processed % 100 === 0) console.log(`  [${processed}/${r.rowCount}] failed: ${failed.length}`);
  }
}

const chunks = [];
for (let i = 0; i < CONCURRENCY; i++) chunks.push([]);
r.rows.forEach((row, idx) => chunks[idx % CONCURRENCY].push(row));
await Promise.all(chunks.map(worker));

console.log(`\nFailed: ${failed.length}`);

// Markaya göre
const byBrand = {};
const byReason = {};
for (const f of failed) {
  byBrand[f.brand_name] = (byBrand[f.brand_name] || 0) + 1;
  byReason[f.reason] = (byReason[f.reason] || 0) + 1;
}
console.log('\n## Sebebe göre:');
for (const [k,v] of Object.entries(byReason).sort((a,b) => b[1]-a[1])) console.log(`  ${v} | ${k}`);
console.log('\n## Markaya göre:');
for (const [k,v] of Object.entries(byBrand).sort((a,b) => b[1]-a[1]).slice(0, 30)) console.log(`  ${v} | ${k}`);

// Markdown rapor
let md = `# Kozmetik Image URL Audit (HEAD test) — 2026-04-29\n\n`;
md += `**Toplam yayında kozmetik:** ${r.rowCount}\n`;
md += `**Erişilemeyen / boş URL:** ${failed.length}\n\n`;
md += `## Sebebe göre dağılım\n\n| Sebep | Sayı |\n|-------|------|\n`;
for (const [k,v] of Object.entries(byReason).sort((a,b) => b[1]-a[1])) md += `| ${k} | ${v} |\n`;
md += `\n## Markaya göre dağılım\n\n| Marka | Sayı |\n|-------|------|\n`;
for (const [k,v] of Object.entries(byBrand).sort((a,b) => b[1]-a[1])) md += `| ${k} | ${v} |\n`;
md += `\n## Tüm problemli ürünler\n\n| ID | Marka | Ürün | Sebep | URL |\n|----|-------|------|-------|-----|\n`;
for (const f of failed) {
  const url = (f.url || '(boş)').slice(0, 70);
  md += `| ${f.product_id} | ${f.brand_name} | ${f.product_name} | ${f.reason} | \`${url}\` |\n`;
}

const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_cosmetic-url-head-test.md');
writeFileSync(reportPath, md);
console.log(`\nRapor: ${reportPath}`);

await c.end();
