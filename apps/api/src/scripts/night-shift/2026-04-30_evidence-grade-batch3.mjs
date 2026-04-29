// Faz D batch 3 — 25 INCI daha grade. Hedef: 262/437 → 287/437 (%65.7)
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const EVIDENCE = {
  // Peptitler
  'peptide-complex':           { grade: 'B', cite: 'Schagen 2017 — multi-peptit kompleks, bireysel peptit literatürüne göre genel B grade (Cosmetics)' },
  'palmitoyl-tripeptide-5':    { grade: 'B', cite: 'Aldag et al. 2016 — Pal-Tripeptide-5 (TGF-β mimic), kollajen sentezi in vitro + klinik (Clin Cosmet Investig Dermatol)' },
  'palmitoyl-tripeptide-1':    { grade: 'B', cite: 'Schagen 2017 — Pal-GHK türevi, kollajen + ECM sentezi (Cosmetics review)' },
  'acetyl-octapeptide-3':      { grade: 'B', cite: 'Blanes-Mira 2002 — Snap-8 (acetyl octapeptide-3), botulinum benzeri SNAP-25 inhibisyonu in vitro (Int J Cosmet Sci)' },

  // Emülsifier / Silikon (formülasyon yardımcı)
  'peg-20-glyceryl-stearate':  { grade: 'C', cite: 'CIR Final Report 2012 — PEG glikol türevi emülsifier, biyolojik aktif değil' },
  'peg-40-stearate':           { grade: 'C', cite: 'CIR Final Report 2012 — PEG stearat emülsifier, geniş kullanım, allerji nadir' },
  'dimethiconevinyl-dimethicone-crosspolymer': { grade: 'B', cite: 'CIR (Dimethicone Crosspolymers Final Report 2018) — silikon ağ, pürüzsüzlük + cilt yüzey film' },

  // Bitkisel Adaptojenler / K-Beauty
  'schisandra-chinensis-berry-extract': { grade: 'C', cite: 'Panossian & Wikman 2008 — şizandra adaptojen, antioksidan in vitro + sınırlı topikal klinik (Phytomedicine)' },
  'astragalus-membranaceus-extract': { grade: 'C', cite: 'Auyeung et al. 2016 — astragaloside topikal anti-aging in vitro + sınırlı klinik (Am J Chin Med)' },
  'rhodiola-rosea-root-extract': { grade: 'C', cite: 'Panossian et al. 2010 — rhodiola adaptojen, antioksidan + anti-stres, topikal sınırlı (Phytomedicine)' },
  'heartleaf-extract':         { grade: 'B', cite: 'Lu et al. 2013 — Houttuynia cordata, anti-enflamatuvar + anti-bakteriyel topikal RCT (Phytother Res); K-beauty popülerliği' },
  'mugwort-extract':           { grade: 'C', cite: 'Lee et al. 2017 — yavşan otu (Artemisia) topikal anti-enflamatuvar in vitro + atopik klinik sınırlı (Pharmacogn Rev)' },
  'nelumbo-nucifera-seed-extract': { grade: 'D', cite: 'Lotus tohumu antioksidan in vitro, topikal klinik kanıt yok' },
  'cica-centella':             { grade: 'B', cite: 'Bylka et al. 2013 — TECA atopik dermatit RCT (Postepy Dermatol Alergol); centella alt formu' },
  'licorice-root-extract':     { grade: 'B', cite: 'Saeedi et al. 2003 — meyan kökü topikal anti-enflamatuvar + depigmentasyon RCT (J Dermatolog Treat)' },

  // Esansiyel Yağlar
  'melaleuca-alternifolia-leaf-oil': { grade: 'A', cite: 'Bassett et al. 1990 — %5 çay ağacı yağı vs %5 BPO, akne lezyon eşit etki + daha az yan etki RCT (Med J Aust); Carson 2006 review' },

  // Yüzey Aktif (yumuşak)
  'lauryl-glucoside':          { grade: 'B', cite: 'CIR Final Report 2014 — bitkisel glikozit yüzey aktif, yumuşak temizlik' },
  'sodium-lauroyl-methyl-isethionate': { grade: 'B', cite: 'CIR Final Report 2018 — cilt-uyumlu sürfaktan, SLES alternatifi' },

  // AHA / PHA / Beta Salicylates
  'malic-acid':                { grade: 'B', cite: 'Smith 1996 — AHA grubu, eksfoliyasyon + nem retansiyonu (Cutis)' },
  'polyhydroxy-acid':          { grade: 'B', cite: 'Green et al. 2009 — PHA (gluconolactone, lactobionic) AHA\'dan daha az tahriş + bariyer onarımı (Cutis)' },
  'betaine-salicylate':        { grade: 'B', cite: 'Salisilik asit + betain konjugatı, daha az iritan BHA türevi, K-beauty kullanımı' },

  // Antioksidan / Vitamin
  'coq10':                     { grade: 'A', cite: 'Knott et al. 2015 — topikal koenzim Q10, mitokondri ATP üretimi + UV koruması RCT (Biofactors); Hoppe et al. 1999' },
  'colloidal-oatmeal':         { grade: 'A', cite: 'Reynertson et al. 2015 — kolloidal yulaf, atopik dermatit FDA OTC skin protectant monograph + RCT (J Drugs Dermatol)' },
  'folic-acid':                { grade: 'C', cite: 'B9 vitamini topikal, oral kullanımı belgeli ama topikal etki kanıtı sınırlı (CIR 2018)' },

  // Probiyotik
  'lactobacillus-ferment':     { grade: 'B', cite: 'Yu et al. 2020 — laktobasillus ferment, ciltteki mikrobiyom dengesi + anti-enflamatuvar (Microorganisms)' },
};

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let updated = 0, skipped = 0, missing = 0;
for (const [slug, data] of Object.entries(EVIDENCE)) {
  const r = await c.query(
    `UPDATE ingredients
     SET evidence_grade = $2,
         evidence_citations = COALESCE(evidence_citations, '[]'::jsonb) || $3::jsonb,
         updated_at = NOW()
     WHERE ingredient_slug = $1
       AND (evidence_grade IS NULL OR evidence_grade = '')
     RETURNING ingredient_slug`,
    [slug, data.grade, JSON.stringify([{ source: data.cite, added: '2026-04-30' }])]
  );
  if (r.rows.length) {
    updated++;
    console.log(`✓ ${slug.padEnd(45)} grade=${data.grade}`);
  } else {
    const exists = await c.query(`SELECT evidence_grade FROM ingredients WHERE ingredient_slug = $1`, [slug]);
    if (exists.rows.length) {
      skipped++;
      console.log(`- ${slug.padEnd(45)} zaten ${exists.rows[0].evidence_grade}`);
    } else {
      missing++;
      console.log(`✗ ${slug} → DB'de yok`);
    }
  }
}

console.log(`\nGüncellenen: ${updated} | Zaten dolu: ${skipped} | DB'de yok: ${missing}`);

const cov = await c.query(`
  SELECT
    COUNT(*) FILTER (WHERE i.evidence_grade IS NOT NULL AND i.evidence_grade != '') AS graded,
    COUNT(*) AS total
  FROM ingredients i
  WHERE EXISTS (
    SELECT 1 FROM product_ingredients pi
    JOIN products p ON p.product_id = pi.product_id
    WHERE pi.ingredient_id = i.ingredient_id AND p.status IN ('published','active')
  )
`);
const cv = cov.rows[0];
const pct = ((cv.graded / cv.total) * 100).toFixed(1);
console.log(`\nKULLANILAN INCI evidence_grade kapsama: ${cv.graded}/${cv.total} (%${pct})`);

await c.end();
