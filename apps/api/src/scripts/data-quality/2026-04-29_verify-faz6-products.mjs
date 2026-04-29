/**
 * Faz 6'da insert edilen 46 ürünün gerçekte resmi marka sitelerinde var olup
 * olmadığını doğrula. Hayalet ürünleri archive et.
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

function tokenize(s) {
  return (s || '').toLowerCase()
    .replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ıİI]/g,'i')
    .replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u')
    .replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/)
    .filter(t => t.length >= 3 && !/^(kapsul|tablet|softgel|softjel|gida|takviye|edici|kapsule)$/.test(t));
}

function jaccard(a, b) {
  const sA = new Set(a), sB = new Set(b);
  const i = [...sA].filter(x => sB.has(x)).length;
  const u = new Set([...sA, ...sB]).size;
  return u > 0 ? i/u : 0;
}

// 1) Faz 6 ürünleri (Sekate alt_text image)
const fa6 = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name, b.brand_slug
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.domain_type='supplement'
    AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id=p.product_id AND i.alt_text LIKE '%sekate%')
  ORDER BY b.brand_slug, p.product_slug
`);
console.log(`Faz 6 ürün sayısı: ${fa6.rowCount}`);

// 2) Resmi sitemap'leri çek
async function fetchVoonka() {
  const r = await fetch('https://www.voonka.com/sitemap.xml', { headers: { 'User-Agent': UA } });
  const xml = await r.text();
  return [...xml.matchAll(/<loc>(https:\/\/www\.voonka\.com\/[^<]+)<\/loc>/g)].map(m => {
    const url = m[1].trim();
    return { url, slug: url.replace('https://www.voonka.com/', '').replace(/\/$/, '') };
  });
}
async function fetchNutraxin() {
  const r = await fetch('https://www.nutraxin.com.tr/product-sitemap.xml', { headers: { 'User-Agent': UA } });
  const xml = await r.text();
  return (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map(m => {
    const url = m.replace(/<\/?loc>/g, '').trim();
    return { url, slug: url.replace('https://www.nutraxin.com.tr/urunler/', '') };
  });
}
async function fetchOrzaxFromSitemap() {
  // Orzax resmi sitemap çalışmıyor, atla
  return [];
}

console.log('Resmi sitemap\'ler indiriliyor...');
const voonka = await fetchVoonka();
const nutraxin = await fetchNutraxin();
console.log(`Voonka: ${voonka.length}, Nutraxin: ${nutraxin.length}`);

// 3) Her Faz 6 ürünü için resmi siteden doğrula
const ghosts = [];  // Resmi sitede yok = hayalet
const verified = [];

for (const p of fa6.rows) {
  const cleanName = p.product_name.replace(new RegExp(p.brand_slug, 'gi'), '').trim();
  const tokens = tokenize(cleanName);

  let bestMatch = { score: 0, url: null };

  if (p.brand_slug === 'voonka') {
    for (const v of voonka) {
      const score = jaccard(tokens, tokenize(v.slug.replace(/^voonka-/, '')));
      if (score > bestMatch.score) bestMatch = { score, url: v.url };
    }
  } else if (p.brand_slug === 'nutraxin') {
    for (const n of nutraxin) {
      const score = jaccard(tokens, tokenize(n.slug));
      if (score > bestMatch.score) bestMatch = { score, url: n.url };
    }
  } else if (p.brand_slug === 'orzax') {
    // Orzax resmi sitemap yok → atla, manuel doğrulama gerekecek
    ghosts.push({ ...p, reason: 'orzax-resmi-site-yok-dogrulanamiyor' });
    continue;
  }

  // Eşik: 0.40 üstü = mevcut, altı = muhtemelen yok
  if (bestMatch.score >= 0.40) {
    verified.push({ ...p, match_score: bestMatch.score, official_url: bestMatch.url });
  } else {
    ghosts.push({ ...p, reason: `dusuk-match-${bestMatch.score.toFixed(2)}`, best_url: bestMatch.url });
  }
}

console.log(`\nDoğrulanmış (resmi sitede mevcut): ${verified.length}`);
console.log(`Şüpheli/yok (hayalet): ${ghosts.length}`);

const byBrand = {};
for (const g of ghosts) byBrand[g.brand_slug] = (byBrand[g.brand_slug] || 0) + 1;
console.log('\n## Şüpheli ürünler markaya göre:');
for (const [k,v] of Object.entries(byBrand).sort((a,b) => b[1]-a[1])) console.log(`  ${v} | ${k}`);

console.log('\n## Şüpheli ürünler örneği:');
for (const g of ghosts.slice(0, 20)) {
  console.log(`  [${g.product_id}] ${g.brand_slug.padEnd(10)} | ${g.product_slug.slice(0,55).padEnd(55)} | ${g.reason}`);
}

// Markdown raporu
const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_faz6-ghost-products.md');
let md = `# Faz 6 Hayalet Ürün Audit — 2026-04-29\n\n`;
md += `## Özet\n- Faz 6 ürün toplam: ${fa6.rowCount}\n- Doğrulanmış (resmi sitede var): ${verified.length}\n- Şüpheli/yok: ${ghosts.length}\n\n`;
md += `## Şüpheli ürünler markaya göre\n\n| Marka | Sayı |\n|-------|------|\n`;
for (const [k,v] of Object.entries(byBrand)) md += `| ${k} | ${v} |\n`;
md += `\n## Şüpheli ürün listesi (resmi sitede bulunamayan)\n\n| ID | Brand | Slug | Reason |\n|----|-------|------|--------|\n`;
for (const g of ghosts) md += `| ${g.product_id} | ${g.brand_slug} | ${g.product_slug} | ${g.reason} |\n`;
md += `\n## Doğrulanmış ürünler\n\n| ID | Brand | Slug | Score | URL |\n|----|-------|------|-------|-----|\n`;
for (const v of verified) md += `| ${v.product_id} | ${v.brand_slug} | ${v.product_slug.slice(0,40)} | ${v.match_score.toFixed(2)} | ${v.official_url} |\n`;
writeFileSync(reportPath, md);
console.log(`\nRapor: ${reportPath}`);

await c.end();
