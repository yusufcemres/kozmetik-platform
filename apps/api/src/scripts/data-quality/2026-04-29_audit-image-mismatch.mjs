/**
 * Görsel-ürün uyumsuzluğu audit:
 * Image URL slug'ındaki anahtar kelimelerle ürün slug'ını karşılaştır.
 * Düşük overlap = muhtemel yanlış eşleşme.
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

function tokenize(s) {
  return s.toLowerCase()
    .replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ıİI]/g,'i')
    .replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u')
    .replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)
    .filter(t => t.length >= 3 && !/^(60|90|30|120|tablet|kapsul|kapsule|gida|takviye|edici|vitamin|mineral|ml|mg|gr|adet|sw\d+|sh\d+)$/.test(t));
}

function jaccard(a, b) {
  const sA = new Set(a), sB = new Set(b);
  const i = [...sA].filter(x => sB.has(x)).length;
  const u = new Set([...sA, ...sB]).size;
  return u > 0 ? i/u : 0;
}

// Faz 1 + Faz 6 ürünleri (Sekate kaynak) ve Voonka/Nutraxin scrape'lenenleri
// alt_text ile filter et
const r = await c.query(`
  SELECT i.image_id, i.product_id, i.image_url, i.alt_text, p.product_slug, p.product_name, b.brand_slug
  FROM product_images i
  JOIN products p ON p.product_id = i.product_id
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.domain_type='supplement'
    AND (i.alt_text LIKE '%sekate%' OR i.alt_text LIKE '%voonka%' OR i.alt_text LIKE '%nutraxin%')
  ORDER BY p.product_id
`);

console.log(`[1] Toplam scrape edilen image: ${r.rowCount}`);

// URL'den slug çıkar (image filename'e bak)
function extractImageSlug(url) {
  // percdn: /p/{slug}-{numeric_id}-sw800sh804.png
  const m = url.match(/\/p\/([^/]+?)(?:-\d+)?-sw\d+sh\d+\.\w+$/);
  if (m) return m[1];
  // voonka: image/cache/.../slug-1000x1000.jpg
  const v = url.match(/\/cache\/.+?\/([^/]+?)-\d+x\d+\.\w+/);
  if (v) return v[1];
  // nutraxin: storage/uploads/{uuid}/{name}.webp
  const n = url.match(/uploads\/[^/]+\/([^/]+?)\.\w+$/);
  if (n) return n[1];
  return null;
}

const mismatches = [];
const correct = [];
const unparseable = [];

for (const row of r.rows) {
  const imgSlug = extractImageSlug(row.image_url);
  if (!imgSlug) {
    unparseable.push(row);
    continue;
  }
  const productTokens = tokenize(row.product_slug);
  const imgTokens = tokenize(imgSlug);
  const score = jaccard(productTokens, imgTokens);
  const item = {
    image_id: row.image_id,
    product_id: row.product_id,
    product_slug: row.product_slug,
    img_slug: imgSlug,
    score: Math.round(score * 100) / 100,
    image_url: row.image_url,
    alt_text: row.alt_text,
  };
  if (score < 0.30) {
    mismatches.push(item);
  } else {
    correct.push(item);
  }
}

console.log(`[2] Doğru eşleşme (score >= 0.30): ${correct.length}`);
console.log(`[3] Yanlış eşleşme şüphesi (score < 0.30): ${mismatches.length}`);
console.log(`[4] Parse edilemeyen URL: ${unparseable.length}`);

console.log('\n## Şüpheli yanlış eşleşmeler (top 30):');
mismatches.sort((a, b) => a.score - b.score);
for (const m of mismatches.slice(0, 30)) {
  console.log(`  [${m.score}] [id=${m.image_id}] DB="${m.product_slug.slice(0,50)}" ↔ IMG="${m.img_slug.slice(0,55)}"`);
}

// Rapor yazma
const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_image-audit.md');
const report = `# Görsel-Ürün Uyumsuzluk Audit — 2026-04-29

## Özet
- Toplam scrape edilen image: ${r.rowCount}
- Doğru eşleşme (jaccard >= 0.30): ${correct.length}
- **Yanlış eşleşme şüphesi (< 0.30): ${mismatches.length}**
- Parse edilemeyen URL: ${unparseable.length}

## Şüpheli yanlış eşleşmeler

| Score | Image ID | DB Ürün Slug | Image Slug | URL |
|-------|----------|---------------|-------------|-----|
${mismatches.map(m => `| ${m.score} | ${m.image_id} | ${m.product_slug.slice(0,40)} | ${m.img_slug.slice(0,40)} | ${m.image_url.slice(-60)} |`).join('\n')}

## Aksiyon
Bu image_id'leri sil veya manuel görsele değiştir.
`;
writeFileSync(reportPath, report);
console.log(`\nRapor: ${reportPath}`);

await c.end();
