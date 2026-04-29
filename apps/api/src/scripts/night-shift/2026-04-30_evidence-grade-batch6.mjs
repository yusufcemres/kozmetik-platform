// Faz D batch 6 — uzun kuyruk INCI evidence_grade. Hedef: 339 → 360+/437
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const EVIDENCE = {
  // Hidrolize Proteinler
  'hydrolyzed-silk':           { grade: 'B', cite: 'CIR 2014 — hidrolize ipek proteini, saç + cilt humektant + film' },
  'hydrolyzed-elastin':        { grade: 'B', cite: 'CIR 2018 — elastin hidrolize, ECM yapı taşı, anti-aging katkı' },
  'silk-amino-acids':          { grade: 'B', cite: 'İpek amino asitleri NMF benzeri humektant, saç + cilt yumuşatıcı (CIR 2014)' },
  'hydrolyzed-wheat-protein':  { grade: 'B', cite: 'CIR 2018 — buğday hidrolize protein, saç film + cilt humektant; gluten alerji uyarı' },

  // Mineral / Şelat / pH
  'sodium-phytate':            { grade: 'B', cite: 'Mehta & Lim 2011 — fitik asit sodyum tuzu, yumuşak şelat ajanı + aydınlatıcı (J Drugs Dermatol)' },
  'sodium-citrate':            { grade: 'C', cite: 'CIR 2014 — pH tampon + zayıf şelat, citrik asit tuzu' },
  'copper-gluconate':          { grade: 'B', cite: 'Bakır mineral kaynağı; bakır peptit (GHK-Cu) kollajen sentezi öncüsü' },

  // Geleneksel / Bitkisel
  'coptis-japonica-root-extract': { grade: 'C', cite: 'Geleneksel Kore tıp, berberine içerikli, anti-mikrobiyal in vitro' },
  'guaiazulene':               { grade: 'B', cite: 'Mavi azulene, papatya esansiyel yağı türevi, anti-enflamatuvar topikal' },
  'ficus-carica-fruit-extract': { grade: 'C', cite: 'İncir meyve özü ficin enzimi + antioksidan; furokumarin nedeniyle hafif fototoksik dikkat' },

  // Antioksidan / Vitamin
  'riboflavin':                { grade: 'B', cite: 'B2 vitamini, doğal flavin antioksidan, oral kullanım dominant; topikal sınırlı' },
  'hydroxyacetophenone':       { grade: 'B', cite: 'CIR 2017 — sentetik antioksidan, koruyucu booster, paraben-free formül' },

  // Polisakarit / Yapı
  'chondroitin':               { grade: 'C', cite: 'GAG yapı taşı, oral kullanım eklem dominant; topikal anti-aging humektant katkı' },
  'dextrin':                   { grade: 'C', cite: 'Polisakarit kıvamlandırıcı, glikoz türevi, allerji nadir' },

  // Yüzey Aktif / Emolyent
  'isoceteth-20':              { grade: 'C', cite: 'CIR 2012 — etoksilenmiş yüzey aktif, emülsifier' },

  // Doğal Yağ
  'colloidal-oatmeal':         { grade: 'A', cite: 'Reynertson et al. 2015 — kolloidal yulaf, atopik FDA OTC monograph + RCT (J Drugs Dermatol)' },

  // Çeşitli
  'malachite-extract':         { grade: 'D', cite: 'Bakır karbonat mineral özü, geleneksel kullanım, modern klinik kanıt sınırlı' },
  'amaranthus-caudatus-seed-extract': { grade: 'D', cite: 'Amarant tohum özü antioksidan in vitro, topikal klinik kanıt sınırlı' },
  'nelumbo-nucifera-seed-extract': { grade: 'D', cite: 'Lotus tohumu antioksidan in vitro, topikal klinik kanıt sınırlı' },

  // K-beauty / Specialty
  'fucoidan':                  { grade: 'C', cite: 'Deniz yosunu polisakarit, in vitro antioksidan + anti-aging, topikal sınırlı klinik' },
  'gold':                      { grade: 'D', cite: 'Kolloid altın, geleneksel pazarlama; modern dermatolojide klinik kanıt yetersiz' },
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
    console.log(`✓ ${slug.padEnd(40)} grade=${data.grade}`);
  } else {
    const exists = await c.query(`SELECT evidence_grade FROM ingredients WHERE ingredient_slug = $1`, [slug]);
    if (exists.rows.length) {
      skipped++;
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
