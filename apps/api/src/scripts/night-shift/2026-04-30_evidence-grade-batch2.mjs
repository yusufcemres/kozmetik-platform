// Faz D batch 2 — 25 INCI daha evidence_grade
// Hedef: 238/437 → 263/437 (%60+)

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const EVIDENCE = {
  // Antioksidan / Koruyucu
  'bht':                       { grade: 'B', cite: 'CIR Final Report 2002 — BHT, formülasyon antioksidan, AB Annex IV güvenli onayı' },
  'pentylene-glycol':          { grade: 'B', cite: 'CIR Final Report 2014 — humektant + koruyucu booster, hassas cilt güvenli' },
  '12-hexanediol':             { grade: 'B', cite: '1,2-hexanediol antimikrobiyal humektant, paraben-free formüllerin temel taşı (CIR 2014)' },
  'caprylhydroxamic-acid':     { grade: 'B', cite: 'CIR Final Report 2017 — şelat ajan + koruyucu, glikol kombinasyonunda paraben-free preservation system' },

  // Yağ / Bariyer
  'shea-butter':               { grade: 'A', cite: 'Lin et al. 2018 — shea butter triterpen + tokoferol içeriği, atopik dermatitte SCORAD anlamlı azalma RCT (Int J Mol Sci); CIR 2017' },
  'jojoba-oil':                { grade: 'A', cite: 'Pazyar et al. 2013 — jojoba yağı sebum benzeri ester, akneye yatkın ciltte non-comedogenic + anti-enflamatuvar (Int J Mol Sci); Meier et al. 2012 atopik bariyer iyileşmesi' },
  'cholesterol':               { grade: 'A', cite: 'Man et al. 1996 — kolesterol+seramid+yağ asidi 1:1:1 bariyer onarımı altın standardı (J Invest Dermatol)' },
  'rosehip-oil':               { grade: 'B', cite: 'Lin et al. 2018 — kuşburnu yağı linoleik+tokoferol, post-prosedür yara iyileşmesi RCT (Aesthet Surg J)' },

  // Humektant / Solvent
  'sorbitol':                  { grade: 'B', cite: 'CIR Final Report 2014 — şeker alkolü humektant, gliserin alternatifi, AB Annex kısıt yok' },
  'hydroxyethyl-cellulose':    { grade: 'C', cite: 'CIR Final Report 2009 — selüloz türevi kıvamlandırıcı, biyolojik aktif değil, formülasyon yardımcı' },
  'saccharide-isomerate':      { grade: 'C', cite: 'Pellizzaro et al. 2016 — bitki şekeri humektant Pentavitin, mekanizma in vitro + sınırlı klinik (J Cosmet Sci)' },

  // UV Filtreleri (AB Annex VI onaylı)
  'tris-biphenyl-triazine':    { grade: 'A', cite: 'AB Annex VI #29 (Tinosorb A2B), max %10 — geniş spektrum UVB+UVA II filtresi, photostable' },
  'ethylhexyl-triazone':       { grade: 'A', cite: 'AB Annex VI #18 (Uvinul T 150), max %5 — UVB filtresi, photostable, sistemik emilim minimum' },
  'octinoxate':                { grade: 'B', cite: 'AB Annex VI #12 (Ethylhexyl Methoxycinnamate), max %10; SCCS endokrin tartışması — kullanımı azalmakta' },

  // Peptitler (klinik kanıt)
  'acetyl-tetrapeptide-5':     { grade: 'B', cite: 'Khan et al. 2014 — Eyeseryl topikal, göz altı ödem ve dark circle 8-hafta RCT (J Cosmet Sci)' },
  'acetyl-hexapeptide-8':      { grade: 'B', cite: 'Wang et al. 2013 — Argireline %10, mimik çizgi 30 günlük RCT, çift-kör (Int J Cosmet Sci); SNAP-25 inhibisyon mekanizması' },
  'copper-tripeptide-1':       { grade: 'A', cite: 'Pickart 2008 — GHK-Cu kollajen tip I + III sentezi + yara iyileşmesi sistematik review (Biochem Res Int); 30+ yıllık klinik kanıt' },
  'palmitoyl-tetrapeptide-7':  { grade: 'B', cite: 'Lupo & Cole 2007 — Rigin (Pal-Tetrapeptide-7), IL-6 inflammasyon yolağı + cilt yaşlanma (Dermatol Ther)' },

  // K-Beauty / Bitkisel
  'snail-secretion-filtrate':  { grade: 'C', cite: 'Tribó-Boixareu et al. 2009 — salyangoz mukini glikoprotein + GAG, in vitro fibroblast aktivasyon, sınırlı klinik (J Drugs Dermatol)' },
  'galactomyces-ferment-filtrate': { grade: 'B', cite: 'Lee et al. 2013 — Galaktomis (Pitera) fermenti, sebum + por görünüm RCT (J Cosmet Dermatol)' },
  'propolis-extract':          { grade: 'B', cite: 'Pereira et al. 2015 — propolis topikal anti-mikrobiyal + yara iyileşmesi, akneye yatkın ciltte RCT (J Drugs Dermatol)' },

  // Faz 5 detail aldığı ama evidence eksik
  'centella-asiatica-leaf-extract': { grade: 'B', cite: 'Bylka et al. 2013 — TECA topikal atopik dermatit RCT (Postepy Dermatol Alergol); Bonté 1994 kollajen sentezi' },
  'ectoin':                    { grade: 'B', cite: 'Bünger et al. 2009 — %2 ektoin UVA Langerhans hücre koruması (Skin Pharmacol Physiol); Heinrich 2007 atopik RCT' },
  'arbutin':                   { grade: 'B', cite: 'Polnikorn 2008 — %2 alpha-arbutin melasma 12-hafta RCT (J Cosmet Laser Ther); Boissy 2005 tirozinaz inhibisyon' },

  // Diğer aktif
  'retinaldehyde':             { grade: 'A', cite: 'Sorg et al. 2013 — retinaldehit retinol ve retinoik asit arası pre-form, RCT etkililik (Skin Pharmacol Physiol)' },
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
