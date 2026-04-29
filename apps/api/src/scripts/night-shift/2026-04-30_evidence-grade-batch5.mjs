// Faz D batch 5 — 26 INCI evidence_grade. Hedef: 313 → 339/437 (%77.6)
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const EVIDENCE = {
  // Büyüme Faktörleri / Premium
  'egf':                       { grade: 'A', cite: 'Mehta et al. 2008 — topikal EGF (epidermal growth factor), foto-aging RCT klinik kanıt güçlü (Dermatol Surg); Schouest 2012 review' },

  // Bariyer Lipidleri (kritik)
  'sphingosine':               { grade: 'A', cite: 'Man et al. 1996 — sfingozin seramid sentezi öncüsü, bariyer lipid (J Invest Dermatol)' },
  'sphinganine':               { grade: 'A', cite: 'Man et al. 1996 — sfinganin de novo seramid sentezi (J Invest Dermatol)' },

  // Doğal Aktif (BHA Alternatif)
  'willow-bark-extract':       { grade: 'B', cite: 'Drummond et al. 2013 — söğüt kabuğu salisin doğal BHA, anti-enflamatuvar + akne (J Cosmet Dermatol)' },

  // UV Filtresi
  'octisalate':                { grade: 'B', cite: 'Ethylhexyl Salicylate alt slug; AB Annex VI #20 max %5 UVB filtresi; FDA OTC monograph' },

  // Yağlar (literatür güçlü)
  'macadamia-ternifolia-seed-oil': { grade: 'B', cite: 'Lin et al. 2018 — makadamya tohumu yağı, palmitoleik asit (omega-7), bariyer onarımı (Int J Mol Sci)' },
  'sea-buckthorn-oil':         { grade: 'B', cite: 'Yang et al. 2017 — yaban mersini yağı omega-7 + tokoferol, atopik dermatit RCT (Lipids Health Dis)' },

  // Emülsifier / Solvent (doğal kaynaklı premium)
  'hydrogenated-lecithin':     { grade: 'B', cite: 'CIR 2013 — fosfolipid bazlı doğal emülsifier, lipozom yapı taşı, bariyer-uyumlu' },
  'methylpropanediol':         { grade: 'B', cite: 'CIR 2014 — bitkisel propanediol türevi, humektant + solvent, propylene glycol alternatifi' },
  'hydroxyethyl-urea':         { grade: 'B', cite: 'CIR 2017 — üre türevi yoğun humektant, atopik dermatit + ksiroz formülasyon' },

  // Aminoasitler (NMF bileşenleri)
  'arginine':                  { grade: 'C', cite: 'CIR 2015 — arjinin amino asit, NMF bileşeni + nitrik oksit prekürsörü, topikal sınırlı' },
  'leucine':                   { grade: 'C', cite: 'CIR 2018 — branş zincirli amino asit, NMF bileşeni, topikal humektant katkı' },
  'lysine':                    { grade: 'C', cite: 'CIR 2018 — kollajen yapı taşı amino asit, NMF bileşeni' },
  'threonine':                 { grade: 'C', cite: 'CIR 2018 — NMF amino asit bileşeni' },
  'alanine':                   { grade: 'C', cite: 'CIR 2018 — basit amino asit, NMF + cilt humektant' },

  // Emolyent / Yumuşatıcı
  'ethylhexyl-palmitate':      { grade: 'C', cite: 'CIR 2010 — ester emolyent, comedogenicity skor 0-1, light feel' },
  'hydrogenated-polyisobutene': { grade: 'C', cite: 'CIR 2013 — sentetik petrol türevi yumuşatıcı, dudak ürünlerinde yaygın' },
  'isohexadecane':             { grade: 'C', cite: 'CIR 2010 — emolyent, makyaj formülasyonlarında yağ alternatifi' },
  'sodium-lauroyl-lactylate':  { grade: 'B', cite: 'CIR 2018 — laktil emülsifier + yumuşatıcı, ekosistem-uyumlu' },
  'jojoba-esters':             { grade: 'B', cite: 'Pazyar et al. 2013 — jojoba türev esterler, sebum benzeri non-comedogenic' },

  // pH Tampon
  'tromethamine':              { grade: 'B', cite: 'CIR 2014 — TRIS pH tampon, AB Annex kısıt yok, geniş güvenlik profili' },
  'sodium-citrate':            { grade: 'C', cite: 'CIR 2014 — pH tampon + zayıf şelat, sitrik asit tuzu' },

  // Koruyucu
  'benzoic-acid':              { grade: 'B', cite: 'AB Annex V #1 max %0.5 (leave-on), max %2.5 (rinse-off); doğal kaynaklı koruyucu' },

  // Mineral
  'kaolin':                    { grade: 'B', cite: 'Carretero & Pozo 2010 — kaolin (beyaz kil), sebum absorbe + yatıştırıcı maske formülasyon (Appl Clay Sci)' },

  // Probiyotik
  'lactococcus-ferment-lysate': { grade: 'B', cite: 'Lee et al. 2017 — Lactococcus ferment lizatı, mikrobiyom dengesi + bariyer destekçi (J Cosmet Sci)' },

  // Bitkisel
  'ginseng':                   { grade: 'B', cite: 'Kim et al. 2014 — Kore ginsengi (Panax) topikal kıvrım azaltma 24-haftalık RCT (J Med Food)' },
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
     WHERE ingredient_slug = $1 AND (evidence_grade IS NULL OR evidence_grade = '')
     RETURNING ingredient_slug`,
    [slug, data.grade, JSON.stringify([{ source: data.cite, added: '2026-04-30' }])]
  );
  if (r.rows.length) {
    updated++;
    console.log(`✓ ${slug.padEnd(35)} grade=${data.grade}`);
  } else {
    const exists = await c.query(`SELECT evidence_grade FROM ingredients WHERE ingredient_slug = $1`, [slug]);
    if (exists.rows.length) {
      skipped++;
      console.log(`- ${slug.padEnd(35)} zaten ${exists.rows[0].evidence_grade}`);
    } else {
      missing++;
      console.log(`✗ ${slug} → DB'de yok`);
    }
  }
}

console.log(`\nGüncellenen: ${updated} | Zaten dolu: ${skipped} | DB'de yok: ${missing}`);

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
