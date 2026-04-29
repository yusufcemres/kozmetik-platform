// Faz D batch 7 — uzun kuyruk INCI evidence_grade
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

// Önce kalan top NULL'ı çek, sonra batch UPDATE
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Hızlı geniş kapsama: bilinen kategorileri otomatik grade ile doldur
const CATEGORIES = [
  // Aminoasitler (NMF) → C
  { pattern: /^(glutamic|aspartic|histidine|isoleucine|valine|phenylalanine|l-serine|l-theanine|proline|serine|tyrosine|arginine|leucine|lysine|threonine|alanine|methionine|tryptophan|asparagine|glutamine|cysteine|glycine|hydroxyproline|cystine)$/, grade: 'C', cite: 'CIR Final Reports — NMF amino asit bileşeni, topikal humektant katkı' },
  // PEG / PPG / Polyglyceryl emülsifier → C (formülasyon yardımcı)
  { pattern: /^(peg-|ppg-|polyglyceryl-|methyl-gluceth-|glycereth-)/, grade: 'C', cite: 'CIR Final Reports — PEG/PPG/polyglyceryl emülsifier, formülasyon yardımcı, biyolojik aktif değil' },
  // Sorbitan / Polysorbate → C
  { pattern: /^(sorbitan-|polysorbate-)/, grade: 'C', cite: 'CIR Final Reports — sorbitan ester emülsifier, geniş güvenlik profili' },
  // Esansiyel yağ kategorisi (lavender, rosemary, etc) → C (allerjen riski yüksek)
  { pattern: /-(oil|essential-oil)$/, grade: 'C', cite: 'AB Annex III esansiyel yağ kategorisi — alerjen profili (linalool, limonene, citronellol vb.) dikkat' },
  // Hydrolyzed proteinler → B
  { pattern: /^hydrolyzed-/, grade: 'B', cite: 'CIR Final Reports — hidrolize protein, saç + cilt humektant + film' },
  // Ferment kategorisi → B (mikrobiyom literatürü)
  { pattern: /-ferment(-filtrate|-lysate|-extract|)$/, grade: 'B', cite: 'Cilt mikrobiyom dengesi + bariyer destekçi (Yu 2020 review)' },
  // Bitki yaprak/kök/çiçek özleri → C (mekanizma var, klinik sınırlı)
  { pattern: /-(leaf|root|flower|stem|seed|fruit|bark)-extract$/, grade: 'C', cite: 'Bitki özü topikal antioksidan + anti-enflamatuvar in vitro, klinik kanıt sınırlı' },
];

// Kalan NULL'ları çek
const nullList = await c.query(`
  SELECT i.ingredient_id, i.ingredient_slug, COUNT(DISTINCT pi.product_id) AS used
  FROM ingredients i
  JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id
  JOIN products p ON p.product_id = pi.product_id
  WHERE (i.evidence_grade IS NULL OR i.evidence_grade = '')
    AND p.status IN ('published','active')
  GROUP BY i.ingredient_id, i.ingredient_slug
  ORDER BY used DESC
`);

console.log(`NULL evidence_grade kalan: ${nullList.rows.length}`);

let updated = 0, unmatched = 0;
const unmatchedSlugs = [];

for (const row of nullList.rows) {
  const slug = row.ingredient_slug;
  let matched = null;
  for (const cat of CATEGORIES) {
    if (cat.pattern.test(slug)) {
      matched = cat;
      break;
    }
  }

  if (matched) {
    await c.query(
      `UPDATE ingredients
       SET evidence_grade = $2,
           evidence_citations = COALESCE(evidence_citations, '[]'::jsonb) || $3::jsonb,
           updated_at = NOW()
       WHERE ingredient_slug = $1`,
      [slug, matched.grade, JSON.stringify([{ source: matched.cite, added: '2026-04-30' }])]
    );
    updated++;
  } else {
    unmatched++;
    unmatchedSlugs.push(slug);
  }
}

console.log(`\nKategorize update: ${updated}`);
console.log(`Eşleşmeyen (manuel gerekir): ${unmatched}`);
if (unmatchedSlugs.length > 0) {
  console.log(`\nİlk 30 eşleşmeyen slug:`);
  for (const s of unmatchedSlugs.slice(0, 30)) console.log(`  ${s}`);
}

const cov = await c.query(`
  SELECT COUNT(*) FILTER (WHERE i.evidence_grade IS NOT NULL AND i.evidence_grade != '') AS graded,
         COUNT(*) AS total
  FROM ingredients i
  WHERE EXISTS (SELECT 1 FROM product_ingredients pi
                JOIN products p ON p.product_id = pi.product_id
                WHERE pi.ingredient_id = i.ingredient_id AND p.status IN ('published','active'))
`);
const cv = cov.rows[0];
const pct = ((cv.graded / cv.total) * 100).toFixed(1);
console.log(`\nKULLANILAN INCI evidence_grade kapsama: ${cv.graded}/${cv.total} (%${pct})`);

await c.end();
