/**
 * Konsolide eksik görsel listesi:
 * - Takviye (image yok)
 * - Kozmetik (HEAD test başarısız + image yok)
 * Markaya göre gruplu, kullanıcı manuel iletmek için tek rapor.
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

const allProducts = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, p.domain_type,
    b.brand_name, b.brand_slug,
    (SELECT i.image_url FROM product_images i WHERE i.product_id=p.product_id ORDER BY i.sort_order LIMIT 1) AS url,
    (SELECT COUNT(*) FROM product_images i WHERE i.product_id=p.product_id) AS cnt
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.status='published'
  ORDER BY p.domain_type, b.brand_name, p.product_name
`);

console.log(`Total published: ${allProducts.rowCount}`);

// Paralel HEAD test (kozmetik için)
const CONCURRENCY = 12;
async function checkUrl(item) {
  if (item.cnt === 0) return { ...item, reason: 'no-image-record' };
  const url = item.url || '';
  if (!url || url.trim() === '') return { ...item, reason: 'url-empty' };
  if (!url.startsWith('http')) return { ...item, reason: 'not-http' };
  try {
    const resp = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(6000), redirect: 'follow' });
    if (resp.ok) return null;
    return { ...item, reason: `http-${resp.status}` };
  } catch (e) {
    return { ...item, reason: 'timeout-network' };
  }
}

const failed = [];
let processed = 0;
async function worker(items) {
  for (const item of items) {
    const result = await checkUrl(item);
    if (result) failed.push(result);
    processed++;
    if (processed % 200 === 0) console.log(`  [${processed}/${allProducts.rowCount}] failed: ${failed.length}`);
  }
}

const chunks = [];
for (let i = 0; i < CONCURRENCY; i++) chunks.push([]);
allProducts.rows.forEach((row, idx) => chunks[idx % CONCURRENCY].push(row));
await Promise.all(chunks.map(worker));

console.log(`\nFailed: ${failed.length}`);

// Domain bazında ayır
const supps = failed.filter(f => f.domain_type === 'supplement');
const cosms = failed.filter(f => f.domain_type === 'cosmetic');
console.log(`  Takviye: ${supps.length}`);
console.log(`  Kozmetik: ${cosms.length}`);

// Markdown rapor
let md = `# 📸 Görseli Eksik / Bozuk Tüm Ürünler — 2026-04-29\n\n`;
md += `**Toplam:** ${failed.length} ürün\n`;
md += `- Takviye: **${supps.length}**\n`;
md += `- Kozmetik: **${cosms.length}**\n\n`;
md += `> HEAD test ile gerçek erişilebilirlik kontrol edildi (404/403/timeout/empty hepsi dahil).\n\n`;

// Marka grupları
function groupByBrand(items) {
  const g = {};
  for (const i of items) {
    if (!g[i.brand_name]) g[i.brand_name] = [];
    g[i.brand_name].push(i);
  }
  return Object.entries(g).sort((a,b) => b[1].length - a[1].length);
}

md += `## 🌿 Gıda Takviyeleri (${supps.length})\n\n`;
for (const [brand, items] of groupByBrand(supps)) {
  md += `### ${brand} — ${items.length} ürün\n\n`;
  md += `| ID | Ürün | Slug | Sebep |\n|----|------|------|-------|\n`;
  for (const i of items) {
    md += `| ${i.product_id} | ${i.product_name} | \`${i.product_slug}\` | ${i.reason} |\n`;
  }
  md += `\n`;
}

md += `\n## 💄 Kozmetikler (${cosms.length})\n\n`;
for (const [brand, items] of groupByBrand(cosms)) {
  md += `### ${brand} — ${items.length} ürün\n\n`;
  md += `| ID | Ürün | Slug | Sebep |\n|----|------|------|-------|\n`;
  for (const i of items) {
    md += `| ${i.product_id} | ${i.product_name} | \`${i.product_slug}\` | ${i.reason} |\n`;
  }
  md += `\n`;
}

md += `\n---\n\n## Görsel iletme önerisi\n\n`;
md += `**Marka klasörü tercih:** \`<brand-slug>/\` altında \`<product_id>.jpg\` veya \`<product_slug>.jpg\`.\n`;
md += `Format: jpg / png / webp, 800px+ önerilen.\n`;
md += `Toplu zip + ben otomatik insert ederim.\n`;

const reportPath = resolve(__dirname, '../../../../../MISSING_IMAGES_2026-04-29.md');
writeFileSync(reportPath, md);
console.log(`\nRapor: ${reportPath}`);

await c.end();
