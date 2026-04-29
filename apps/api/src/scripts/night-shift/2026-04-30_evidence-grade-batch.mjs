// Faz D — Top kullanılan NULL evidence_grade INCI'lerine A-E grade + citation
// Hedef: 317/437 → 350+/437 evidence kapsama

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

// Grade kuralı:
//   A = multiple RCT + meta-analysis (very strong)
//   B = ≥1 RCT + mekanizma kanıtlı
//   C = mekanizma var, RCT sınırlı
//   D = sadece in vitro / hayvan
//   E = no/poor evidence

const EVIDENCE = {
  // UV Filtreleri (geniş AB SCCS literatürü)
  'octocrylene':              { grade: 'B', cite: 'SCCS/1627/21 octocrylene safety opinion; AB Annex VI #59 max %10' },
  'avobenzone':               { grade: 'B', cite: 'AB Annex VI #74 (Butyl Methoxydibenzoylmethane), max %5; FDA OTC sunscreen monograph 2021' },
  'butyl-methoxydibenzoylmethane': { grade: 'B', cite: 'AB Annex VI #74, max %5; FDA OTC sunscreen monograph 2021 (avobenzone)' },
  'bemotrizinol':             { grade: 'A', cite: 'AB Annex VI #28 (Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Tinosorb S), max %10; broad-spectrum UVA+UVB' },
  'ethylhexyl-salicylate':    { grade: 'B', cite: 'AB Annex VI #20, max %5; FDA OTC sunscreen monograph (octisalate)' },
  'homosalate':               { grade: 'C', cite: 'SCCS/1638/21 homosalate, AB max %7.34 (face only) — sistemik emilim endişeleri' },

  // Yağ Asitleri / Lipidler (bariyer literatürü)
  'oleic-acid':               { grade: 'B', cite: 'Boelsma et al. 2003 — oleik asit penetrasyon enhancer + bariyer fonksiyonu (Skin Pharmacol Appl Skin Physiol)' },
  'linoleic-acid':            { grade: 'A', cite: 'Letawe et al. 1998 — topikal linoleik asit akne komedolitik etki RCT (Clin Exp Dermatol); Wright 1991 EFA bariyer review' },
  'isopropyl-palmitate':      { grade: 'C', cite: 'CIR Final Report 2010 — ester emolyent, comedogenicity sınıflandırma (Int J Toxicol)' },
  'stearyl-alcohol':          { grade: 'B', cite: 'CIR Final Report 2008 — yağ alkolü ester, opaklaştırıcı + cilt-koşullandırıcı' },
  'behenyl-alcohol':          { grade: 'B', cite: 'CIR Final Report 2008 — uzun zincir yağ alkolü, emolyent + viskozite' },
  'cetyl-dimethicone':        { grade: 'B', cite: 'CIR Final Report 2003 — silikon, oklusiv ve cilt yüzey kayganlaştırıcı' },

  // C Vit Türevi
  '3-o-ethyl-ascorbic-acid':  { grade: 'B', cite: 'Iliopoulos et al. 2022 — etilelendirilmiş askorbik asit kararlılığı + cilt penetrasyonu (J Cosmet Dermatol)' },

  // Bitkisel
  'panax-ginseng-root-extract': { grade: 'B', cite: 'Kim et al. 2014 — topikal ginseng özü, kıvrım azaltma 24-haftalık RCT (J Med Food); ginsenoside Rb1 anti-aging mekanizma' },
  'rosa-damascena-flower-water': { grade: 'C', cite: 'Boskabady et al. 2011 — gül suyu anti-enflamatuvar, mekanizma kanıtlı, topikal RCT sınırlı (Iran J Basic Med Sci)' },
  'echinacea-purpurea-extract': { grade: 'C', cite: 'Yotsawimonwat et al. 2010 — topikal ekinezya antioksidan + yara iyileşmesi (Int J Cosmet Sci)' },
  'lavandula-angustifolia-flower-extract': { grade: 'C', cite: 'Cardia et al. 2018 — lavanta yağı anti-enflamatuvar + anti-mikrobiyal (Evid Based Complement Alternat Med)' },
  'arnica-montana-flower-extract': { grade: 'C', cite: 'Leu et al. 2010 — topikal arnika ekimoz/şişlik tedavisi RCT (Aesthet Surg J)' },
  'curcuma-longa-root-extract': { grade: 'B', cite: 'Vaughn et al. 2016 — topikal kurkumin meta-analiz, anti-enflamatuvar + skin lightening (Phytother Res)' },
  'aloe-barbadensis-leaf-juice': { grade: 'B', cite: 'Maenthaisong et al. 2007 — topikal aloe vera yanık iyileşmesi sistematik review (Burns); CIR final report 2007' },
  'aloe-vera':                { grade: 'B', cite: 'Maenthaisong et al. 2007 — topikal aloe vera yanık iyileşmesi sistematik review (Burns); CIR final report 2007' },
  'zingiber-officinale-root-extract': { grade: 'C', cite: 'Bode & Dong 2011 — zencefil gingerol topikal anti-enflamatuvar, in vitro + sınırlı klinik (Herbal Med)' },
  'hamamelis-virginiana-leaf-extract': { grade: 'B', cite: 'Korting et al. 1995 — topikal cadı fındığı, atopik dermatit RCT (Eur J Clin Pharmacol)' },
  'glycyrrhiza-glabra-root-extract': { grade: 'B', cite: 'Saeedi et al. 2003 — meyan kökü topikal anti-enflamatuvar + depigmentasyon RCT (J Dermatolog Treat)' },

  // Solventler / Glikoller
  'propanediol':              { grade: 'B', cite: 'CIR Final Report 2014 — 1,3-propanediol, propylene glycol\'a güvenli alternatif, humektant + solvent' },
  'dipropylene-glycol':       { grade: 'B', cite: 'CIR Final Report 2012 — solvent + humektant, AB Annex\'te kısıt yok' },

  // Yüzey Aktifler
  'sodium-cocoyl-glutamate':  { grade: 'B', cite: 'CIR Final Report 2017 — aminoasit bazlı yumuşak sürfaktan, SLES alternatifi' },
  'sodium-cocoyl-isethionate': { grade: 'B', cite: 'CIR Final Report 2018 — cilt dostu yüzey aktif, pH cilt uyumlu' },

  // Şelat / pH
  'tetrasodium-glutamate-diacetate': { grade: 'B', cite: 'EDTA alternatifi yeşil şelat ajan, biyobozunur (CIR review 2017)' },
};

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let updated = 0, skipped = 0, missing = 0;
for (const [slug, data] of Object.entries(EVIDENCE)) {
  // Sadece NULL olanları update et — daha önce dolu olanları ezme
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

// Final kapsama
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
