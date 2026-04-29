/**
 * V2 audit: 15sn timeout + 1 retry (network hatalarının false positive olmaması için).
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

const all = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, p.domain_type,
    b.brand_name, b.brand_slug,
    (SELECT i.image_url FROM product_images i WHERE i.product_id=p.product_id ORDER BY i.sort_order LIMIT 1) AS url,
    (SELECT COUNT(*) FROM product_images i WHERE i.product_id=p.product_id) AS cnt
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.status='published'
  ORDER BY p.domain_type, b.brand_name
`);
console.log(`Total: ${all.rowCount}`);

const CONCURRENCY = 8;
async function checkUrl(item) {
  if (item.cnt === 0) return { ...item, reason: 'no-image-record' };
  const url = item.url || '';
  if (!url || url.trim() === '') return { ...item, reason: 'url-empty' };
  if (!url.startsWith('http')) return { ...item, reason: 'not-http' };
  // Try with 15s timeout, 1 retry
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const resp = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000), redirect: 'follow' });
      if (resp.ok) return null;
      if (resp.status === 404) return { ...item, reason: 'http-404' };
      if (resp.status === 403) return { ...item, reason: 'http-403' };
      if (attempt === 2) return { ...item, reason: `http-${resp.status}` };
    } catch (e) {
      if (attempt === 2) return { ...item, reason: 'timeout-network' };
      // retry
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

const failed = [];
let processed = 0;
async function worker(items) {
  for (const item of items) {
    const result = await checkUrl(item);
    if (result) failed.push(result);
    processed++;
    if (processed % 200 === 0) console.log(`  [${processed}/${all.rowCount}] failed: ${failed.length}`);
  }
}

const chunks = [];
for (let i = 0; i < CONCURRENCY; i++) chunks.push([]);
all.rows.forEach((row, idx) => chunks[idx % CONCURRENCY].push(row));
await Promise.all(chunks.map(worker));

console.log(`\nFailed: ${failed.length}`);
const supps = failed.filter(f => f.domain_type === 'supplement');
const cosms = failed.filter(f => f.domain_type === 'cosmetic');
console.log(`  Takviye: ${supps.length}, Kozmetik: ${cosms.length}`);

// Markdown
let md = `# 📸 Görseli Eksik / Bozuk — 2026-04-29 (V2 audit, 15s timeout + retry)\n\n`;
md += `**Toplam:** ${failed.length} ürün\n- Takviye: ${supps.length}\n- Kozmetik: ${cosms.length}\n\n`;
md += `> Önceki V1 audit 6sn timeout ile çok false-positive verdi (network anlık hatası). V2: 15sn + 1 retry.\n\n`;

function group(items) {
  const g = {};
  for (const i of items) (g[i.brand_name] ||= []).push(i);
  return Object.entries(g).sort((a,b) => b[1].length - a[1].length);
}

md += `## 🌿 Gıda Takviyeleri (${supps.length})\n\n`;
for (const [brand, items] of group(supps)) {
  md += `### ${brand} — ${items.length}\n\n| ID | Ürün | Slug | Sebep |\n|----|------|------|-------|\n`;
  for (const i of items) md += `| ${i.product_id} | ${i.product_name} | \`${i.product_slug}\` | ${i.reason} |\n`;
  md += `\n`;
}
md += `## 💄 Kozmetikler (${cosms.length})\n\n`;
for (const [brand, items] of group(cosms)) {
  md += `### ${brand} — ${items.length}\n\n| ID | Ürün | Slug | Sebep |\n|----|------|------|-------|\n`;
  for (const i of items) md += `| ${i.product_id} | ${i.product_name} | \`${i.product_slug}\` | ${i.reason} |\n`;
  md += `\n`;
}

const reportPath = resolve(__dirname, '../../../../../MISSING_IMAGES_2026-04-29.md');
writeFileSync(reportPath, md);
console.log(`\nRapor: ${reportPath}`);

await c.end();
