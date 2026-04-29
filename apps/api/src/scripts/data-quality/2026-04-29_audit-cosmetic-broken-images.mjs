/**
 * Kozmetik görsellerinin gerçek durumu:
 * - URL boş veya null
 * - URL placeholder pattern (data:image, /no-image, icon)
 * - URL formatı bozuk
 * - Aynı ürün için birden fazla aynı URL (duplicate)
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

// 1) Tüm yayında kozmetiklerin image durumu
const r = await c.query(`
  SELECT
    p.product_id, p.product_slug, p.product_name,
    b.brand_name, b.brand_slug,
    (SELECT COUNT(*) FROM product_images i WHERE i.product_id = p.product_id) AS img_count,
    (SELECT i.image_url FROM product_images i WHERE i.product_id = p.product_id ORDER BY i.sort_order ASC LIMIT 1) AS first_url,
    (SELECT i.alt_text FROM product_images i WHERE i.product_id = p.product_id ORDER BY i.sort_order ASC LIMIT 1) AS first_alt
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.domain_type = 'cosmetic' AND p.status = 'published'
  ORDER BY b.brand_name, p.product_name
`);

console.log(`Total kozmetik published: ${r.rowCount}`);

const issues = {
  noImage: [],          // hiç image yok
  emptyUrl: [],         // URL null/boş
  dataUrl: [],          // data:image base64 placeholder
  brokenUrl: [],        // URL pattern garip
  shortUrl: [],         // URL çok kısa (placeholder şüphesi)
  ok: [],
};

const placeholderPatterns = [
  /^data:/i,
  /\/no-image/i,
  /\/placeholder/i,
  /\/default/i,
  /\/icon/i,
  /\/blank/i,
  /^https?:\/\/[^/]+\/?$/,  // sadece domain
];

for (const row of r.rows) {
  if (!row.img_count || row.img_count === 0) {
    issues.noImage.push(row);
    continue;
  }
  const url = row.first_url || '';
  if (!url || url.trim() === '') {
    issues.emptyUrl.push(row);
    continue;
  }
  if (placeholderPatterns.some(p => p.test(url))) {
    issues.dataUrl.push(row);
    continue;
  }
  if (url.length < 30) {
    issues.shortUrl.push(row);
    continue;
  }
  if (!url.startsWith('http')) {
    issues.brokenUrl.push(row);
    continue;
  }
  issues.ok.push(row);
}

console.log('\n## İmage durumu:');
console.log(`  ✅ OK (sağlam URL)   : ${issues.ok.length}`);
console.log(`  ❌ Hiç image yok    : ${issues.noImage.length}`);
console.log(`  ❌ URL boş           : ${issues.emptyUrl.length}`);
console.log(`  ❌ Placeholder/data  : ${issues.dataUrl.length}`);
console.log(`  ❌ URL kısa şüpheli  : ${issues.shortUrl.length}`);
console.log(`  ❌ URL bozuk         : ${issues.brokenUrl.length}`);

// Marka bazında problemli
const problemBrands = {};
for (const cat of ['noImage', 'emptyUrl', 'dataUrl', 'shortUrl', 'brokenUrl']) {
  for (const item of issues[cat]) {
    problemBrands[item.brand_name] = (problemBrands[item.brand_name] || 0) + 1;
  }
}

console.log('\n## Markaya göre problemli:');
for (const [brand, count] of Object.entries(problemBrands).sort((a,b) => b[1]-a[1]).slice(0, 25)) {
  console.log(`  ${count.toString().padStart(3)} | ${brand}`);
}

// HTTP HEAD check için ilk 30 OK URL'yi sample test
console.log('\n## HTTP Erişilebilirlik testi (sample 30 OK):');
const samples = issues.ok.slice(0, 30);
let httpOk = 0, httpFail = 0, http404 = 0;
for (const s of samples) {
  try {
    const r = await fetch(s.first_url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    if (r.ok) httpOk++;
    else if (r.status === 404) http404++;
    else httpFail++;
  } catch {
    httpFail++;
  }
}
console.log(`  Erişilebilir: ${httpOk}/30, 404: ${http404}, Hata: ${httpFail}`);

// Markdown rapor
let md = `# Kozmetik Görsel Audit — 2026-04-29\n\n`;
md += `**Toplam yayında kozmetik:** ${r.rowCount}\n\n`;
md += `## İmage Durumu\n\n`;
md += `| Durum | Sayı |\n|-------|------|\n`;
md += `| ✅ OK | ${issues.ok.length} |\n`;
md += `| ❌ Hiç image yok | ${issues.noImage.length} |\n`;
md += `| ❌ URL boş | ${issues.emptyUrl.length} |\n`;
md += `| ❌ Placeholder/data | ${issues.dataUrl.length} |\n`;
md += `| ❌ URL kısa şüpheli | ${issues.shortUrl.length} |\n`;
md += `| ❌ URL bozuk | ${issues.brokenUrl.length} |\n\n`;
md += `**Toplam problem:** ${r.rowCount - issues.ok.length}\n\n`;

md += `## Markaya göre problemli ürünler\n\n`;
md += `| Marka | Sayı |\n|-------|------|\n`;
for (const [brand, count] of Object.entries(problemBrands).sort((a,b) => b[1]-a[1])) {
  md += `| ${brand} | ${count} |\n`;
}

md += `\n## Detay listeler\n\n`;
for (const cat of ['noImage', 'dataUrl', 'shortUrl', 'brokenUrl']) {
  if (issues[cat].length === 0) continue;
  md += `### ${cat} (${issues[cat].length})\n\n`;
  md += `| ID | Marka | Ürün | İlk URL |\n|----|-------|------|---------|\n`;
  for (const item of issues[cat].slice(0, 50)) {
    const url = (item.first_url || '').slice(0, 80);
    md += `| ${item.product_id} | ${item.brand_name} | ${item.product_name} | \`${url}\` |\n`;
  }
  if (issues[cat].length > 50) md += `\n...ve ${issues[cat].length - 50} daha\n`;
  md += `\n`;
}

const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_cosmetic-image-audit.md');
writeFileSync(reportPath, md);
console.log(`\nRapor: ${reportPath}`);

await c.end();
