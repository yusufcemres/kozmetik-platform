/**
 * Görseli olmayan tüm ürünlerin listesi (kullanıcı manuel iletecek için).
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
  SELECT
    p.product_id,
    p.product_slug,
    p.product_name,
    p.domain_type,
    b.brand_name,
    b.brand_slug,
    b.website_url AS brand_website
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.status = 'published'
    AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.product_id)
  ORDER BY p.domain_type, b.brand_name, p.product_name
`);

console.log(`Toplam görseli eksik ürün: ${r.rowCount}`);

// Markaya göre grupla
const byBrand = {};
for (const row of r.rows) {
  const key = `${row.domain_type}|${row.brand_name}|${row.brand_website || ''}`;
  if (!byBrand[key]) byBrand[key] = [];
  byBrand[key].push(row);
}

// Markdown rapor
let md = `# Görseli Eksik Ürünler — 2026-04-29\n\n`;
md += `**Toplam: ${r.rowCount} ürün**\n\n`;
md += `> Görseli kullanıcı manuel iletecek. Her ürün için 1 kaliteli görsel yeterli (jpg/png/webp 800px+ tercih).\n\n`;

const supplements = Object.entries(byBrand).filter(([k]) => k.startsWith('supplement|'));
const cosmetics = Object.entries(byBrand).filter(([k]) => k.startsWith('cosmetic|'));

md += `## 🌿 Gıda Takviyeleri (${supplements.reduce((a,[,v]) => a+v.length, 0)})\n\n`;

for (const [key, items] of supplements.sort((a,b) => b[1].length - a[1].length)) {
  const [, brand, website] = key.split('|');
  md += `### ${brand} — ${items.length} ürün`;
  if (website) md += ` ([${new URL(website).hostname}](${website}))`;
  md += `\n\n`;
  md += `| # | Ürün | Slug |\n|---|------|------|\n`;
  for (const item of items) {
    md += `| ${item.product_id} | ${item.product_name} | \`${item.product_slug}\` |\n`;
  }
  md += `\n`;
}

md += `\n## 💄 Kozmetikler (${cosmetics.reduce((a,[,v]) => a+v.length, 0)})\n\n`;

for (const [key, items] of cosmetics.sort((a,b) => b[1].length - a[1].length)) {
  const [, brand, website] = key.split('|');
  md += `### ${brand} — ${items.length} ürün`;
  if (website) md += ` ([${new URL(website).hostname}](${website}))`;
  md += `\n\n`;
  md += `| # | Ürün | Slug |\n|---|------|------|\n`;
  for (const item of items) {
    md += `| ${item.product_id} | ${item.product_name} | \`${item.product_slug}\` |\n`;
  }
  md += `\n`;
}

md += `\n---\n\n## Görsel iletme formatı\n\n`;
md += `**Tercih edilen yol:** Her ürünün görselini şu formatta yükleyin:\n`;
md += `- Dosya adı = product_id (örn: \`2745.jpg\`, \`2746.png\`)\n`;
md += `- Veya dosya adı = product_slug (örn: \`nutraxin-bromelain-500mg-60-tablet.jpg\`)\n`;
md += `- Format: jpg / png / webp (800px+ önerilen)\n\n`;
md += `**Toplu yükleme:** Tek bir zip dosyası (örn: \`revela-images-2026-04-29.zip\`) → ben otomatik insert ederim.\n\n`;
md += `**Tek tek:** Direkt URL paylaşırsanız (Drive/Dropbox/Imgur), ben fetch + insert yaparım.\n`;

const reportPath = resolve(__dirname, '../../../../../MISSING_IMAGES_2026-04-29.md');
writeFileSync(reportPath, md);
console.log(`\nRapor: ${reportPath}`);

// Özet konsolda
console.log('\n## Özet (markaya göre):');
const brandSummary = {};
for (const row of r.rows) {
  brandSummary[row.brand_name] = (brandSummary[row.brand_name] || 0) + 1;
}
for (const [brand, count] of Object.entries(brandSummary).sort((a,b) => b[1] - a[1])) {
  console.log(`  ${count.toString().padStart(3)} | ${brand}`);
}

await c.end();
