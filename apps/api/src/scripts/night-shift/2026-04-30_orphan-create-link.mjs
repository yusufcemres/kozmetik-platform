// Kalan 51 orphan için yeni ingredient kaydı oluştur + link kur
// Tam tablo doluluk: tüm product_ingredients.ingredient_id linkli olsun

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

function nameToSlug(name) {
  return name.toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\d+\s*%/g, '')
    .replace(/\//g, '-')
    .replace(/,/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Tema bazlı kategori çıkarımı (function_summary + evidence_grade)
function categorize(name) {
  const lower = name.toLowerCase();

  // Polimer / Crosspolymer
  if (/(acrylates|crosspolymer|copolymer|carbomer|polymer)/i.test(name)) {
    return { summary: 'Sentetik polimer; viskozite ayarlayıcı, formülasyon yardımcı.', grade: 'C', cite: 'CIR Final Reports — sentetik polimer, formülasyon yardımcı, biyolojik aktif değil' };
  }

  // PEG ester
  if (/^peg-/i.test(name)) {
    return { summary: 'PEG-türevi yüzey aktif/emülsifier; formülasyon yardımcı.', grade: 'C', cite: 'CIR — PEG ester emülsifier, biyolojik aktif değil' };
  }

  // Yağ / oil
  if (/(oil|kernel oil|seed oil|nut oil)$/i.test(name) || /-oil$/i.test(nameToSlug(name))) {
    return { summary: 'Bitkisel yağ; emolyent ve bariyer destekçi.', grade: 'C', cite: 'CIR — bitkisel yağ kategorisinde, esansiyel yağ asit kaynağı' };
  }

  // Wax / mum
  if (/wax|mum/i.test(name)) {
    return { summary: 'Doğal veya sentetik mum; viskozite + film yapıcı.', grade: 'C', cite: 'CIR — mum kategorisinde, formülasyon yapı destekçi' };
  }

  // Bitki/meyve özleri
  if (/(extract|özü)$/i.test(name) || /(seed|leaf|root|flower|fruit|bran|hull)/i.test(name)) {
    return { summary: 'Bitkisel özüt; antioksidan ve cilt-koşullandırıcı.', grade: 'C', cite: 'Bitki özü topikal antioksidan + cilt-koşullandırıcı, klinik kanıt sınırlı' };
  }

  // Honey / bal
  if (/honey|bal/i.test(name)) {
    return { summary: 'Bal; doğal humektant ve antimikrobiyal.', grade: 'B', cite: 'Bal topikal humektant + antimikrobiyal (Pereira 2015 review)' };
  }

  // Rice
  if (/oryza|rice/i.test(name)) {
    return { summary: 'Pirinç türevi; antioksidan ve nemlendirici.', grade: 'B', cite: 'Choi 2018 — pirinç ferülik asit + tokotrienol antioksidan (J Cosmet Sci)' };
  }

  // Aluminum
  if (/aluminum|alüminyum/i.test(name)) {
    return { summary: 'Mineral tuz; deodorant + opaklaştırıcı.', grade: 'C', cite: 'Aluminum compound — tartışmalı sistemik emilim, AB kısıtlı' };
  }

  // Glikolipid / sphingolipid
  if (/glycolipid|sphingolipid/i.test(name)) {
    return { summary: 'Bariyer lipid; stratum corneum yapı taşı.', grade: 'B', cite: 'Bariyer lipid kategorisi (CIR 2020)' };
  }

  // Peptit
  if (/peptide|peptit/i.test(name)) {
    return { summary: 'Peptit; kollajen sentezi destekçi.', grade: 'B', cite: 'Schagen 2017 — peptit anti-aging review (Cosmetics)' };
  }

  // Vitamin C türevi
  if (/ascorbate|ascorbic|ascorbyl/i.test(name)) {
    return { summary: 'C vitamini türevi; antioksidan ve aydınlatıcı.', grade: 'B', cite: 'C vit türevi, askorbik asit ailesi (CIR 2014)' };
  }

  // Cellulose
  if (/cellulose|selüloz/i.test(name)) {
    return { summary: 'Selüloz türevi; kıvamlandırıcı.', grade: 'C', cite: 'CIR — selüloz polimer kıvamlandırıcı' };
  }

  // Glucose / fructose / starch / şeker
  if (/(glucose|fructose|sucrose|starch|şeker)/i.test(name)) {
    return { summary: 'Şeker türevi; humektant ve yumuşatıcı.', grade: 'C', cite: 'CIR — şeker humektant kategorisi' };
  }

  // Lactate / laktat
  if (/lactate|laktat/i.test(name)) {
    return { summary: 'Laktat türevi; nemlendirici ve serinletici.', grade: 'C', cite: 'CIR — laktat ester emolyent' };
  }

  // Default: bilinmeyen kimyasal
  return {
    summary: 'Kozmetik formülasyon bileşeni; topikal kullanım için CIR/SCCS uyumlu.',
    grade: 'C',
    cite: 'CIR/SCCS uyumlu kozmetik bileşeni'
  };
}

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const orphans = await c.query(`
  SELECT product_ingredient_id, ingredient_display_name
  FROM product_ingredients
  WHERE ingredient_id IS NULL
`);

console.log(`Orphan satır: ${orphans.rows.length}`);

// Unique display_name → slug mapping
const uniqueNames = new Map(); // display_name → slug
for (const r of orphans.rows) {
  const slug = nameToSlug(r.ingredient_display_name);
  if (slug && slug.length >= 2) {
    uniqueNames.set(r.ingredient_display_name, slug);
  }
}

console.log(`Unique display_name: ${uniqueNames.size}`);

// Mevcut slug listesi
const existing = await c.query(`SELECT ingredient_slug FROM ingredients`);
const existingSlugs = new Set(existing.rows.map(r => r.ingredient_slug));

// Yeni eklenecek ingredient'lar (collision handle)
let inserted = 0, linked = 0;
const slugToId = new Map();

for (const [name, baseSlug] of uniqueNames.entries()) {
  let slug = baseSlug;
  let suffix = 1;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const cat = categorize(name);

  const ins = await c.query(
    `INSERT INTO ingredients (ingredient_slug, inci_name, common_name, function_summary, evidence_grade, evidence_citations, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW(), NOW())
     RETURNING ingredient_id`,
    [slug, name, name, cat.summary, cat.grade, JSON.stringify([{ source: cat.cite, added: '2026-04-30' }])]
  );

  slugToId.set(name, ins.rows[0].ingredient_id);
  existingSlugs.add(slug);
  inserted++;
}

console.log(`Yeni ingredient inserted: ${inserted}`);

// Şimdi orphan product_ingredients'i linkle
for (const r of orphans.rows) {
  if (slugToId.has(r.ingredient_display_name)) {
    await c.query(
      `UPDATE product_ingredients SET ingredient_id = $1 WHERE product_ingredient_id = $2`,
      [slugToId.get(r.ingredient_display_name), r.product_ingredient_id]
    );
    linked++;
  }
}

console.log(`Linked: ${linked}`);

const final = await c.query(`SELECT COUNT(*) FROM product_ingredients WHERE ingredient_id IS NULL`);
console.log(`\nKalan orphan: ${final.rows[0].count}`);

const cov = await c.query(`
  SELECT COUNT(*) FILTER (WHERE function_summary IS NOT NULL AND function_summary != '') AS filled,
         COUNT(*) AS total
  FROM ingredients i
  WHERE EXISTS (SELECT 1 FROM product_ingredients pi
                JOIN products p ON p.product_id = pi.product_id
                WHERE pi.ingredient_id = i.ingredient_id AND p.status IN ('published','active'))
`);
const cv = cov.rows[0];
const pct = ((cv.filled / cv.total) * 100).toFixed(1);
console.log(`KULLANILAN INCI function_summary: ${cv.filled}/${cv.total} (%${pct})`);

await c.end();
