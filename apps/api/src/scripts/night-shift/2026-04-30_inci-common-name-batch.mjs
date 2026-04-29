// Faz 6 — NULL common_name uzun kuyruk INCI Türkçe mapping
// 86 INCI → kullanılan INCI havuzunda %100 common_name kapsama hedefi

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const MAPPINGS = {
  // Aminoasitler
  'glutamic-acid': 'Glutamik Asit (Amino Asit)',
  'aspartic-acid': 'Aspartik Asit (Amino Asit)',
  'histidine': 'Histidin (Amino Asit)',
  'isoleucine': 'İzolösin (Amino Asit)',
  'valine': 'Valin (Amino Asit)',
  'phenylalanine': 'Fenilalanin (Amino Asit)',
  'l-serine': 'L-Serin (Amino Asit)',
  'l-theanine': 'L-Teanin (Amino Asit)',

  // Vitaminler / Aktifler
  'beta-carotene': 'Beta Karoten (A Vit. Ön Maddesi)',
  'riboflavin-5-phosphate': 'Riboflavin 5-Fosfat (B2 Vitamini)',
  'inositol': 'İnositol (B Vit. Türevi)',
  'ergothioneine': 'Ergotioneine (Antioksidan)',
  'pca': 'PCA (Doğal Nemlendirici Faktör)',

  // Peptitler
  'acetyl-tetrapeptide-2': 'Asetil Tetrapeptit-2 (Anti-Aging Peptit)',
  'palmitoyl-tripeptide-38': 'Palmitoil Tripeptit-38 (Matrixyl Synthe\'6, Anti-Aging)',
  'pentapeptide-18': 'Pentapeptit-18 (Leuphasyl, Mimik Çizgi Peptiti)',
  'dipeptide-diaminobutyroyl-benzylamide-diacetate': 'Dipeptit Diaminobutiroil (Syn-Ake, Mimik Çizgi)',
  'acetylarginyltryptophyl-diphenylglycine': 'Asetilarginiltriptofil Difenilglisin (Anti-Aging Peptit)',

  // Bariyer / Seramid grubu
  'sphingosine': 'Sfingosin (Bariyer Lipidi)',
  'sphinganine': 'Sfinganin (Bariyer Lipidi)',
  'ceramide-ns': 'Seramid NS (Bariyer Lipidi)',
  'sodium-hyaluronate-crosspolymer': 'Sodyum Hyaluronat Crosspolymer (HA Türevi)',

  // Bitki Özleri
  'pine-bark-extract': 'Çam Kabuğu Özü (Pycnogenol)',
  'vitex-agnus-castus-extract': 'Hayıt Ağacı (Vitex) Özü',
  'bixa-orellana-seed-extract': 'Annatto (Achiote) Tohum Özü (Doğal Pigment)',
  'camellia-japonica-seed-oil': 'Japon Kamelyası Tohum Yağı',
  'oryza-sativa-bran-oil': 'Pirinç Kepeği Yağı',
  'solanum-lycopersicum-fruit-extract': 'Domates Meyve Özü (Likopen Kaynağı)',
  'tribulus-terrestris-extract': 'Demirdiken (Tribulus) Özü',
  'tremella-fuciformis-sporocarp-extract': 'Tremella (Kar Mantarı) Özü',
  'ficus-carica-fruit-extract': 'İncir Meyve Özü',
  'amaranthus-caudatus-seed-extract': 'Amarant (Kuyruk Çiçeği) Tohum Özü',
  'anemarrhena-asphodeloides-root-extract': 'Anemarrhena Kök Özü',
  'cyperus-rotundus-root-extract': 'Topalak (Cypéro Otu) Kök Özü',
  'sphingomonas-ferment-extract': 'Sfingomonas Ferment Özü (Probiyotik)',
  'malachite-extract': 'Malakit Mineral Özü',

  // Yağlar
  'elaeis-guineensis-oil': 'Afrika Palmiye Yağı',
  'rhus-succedanea-fruit-wax': 'Japon Mum Ağacı Mumu',
  'hydrogenated-vegetable-oil': 'Hidrojenize Bitkisel Yağ',

  // Yüzey Aktif / Sürfaktan / Emolyent
  'sodium-isethionate': 'Sodyum İsetiyonat (Yumuşak Sürfaktan)',
  'isohexadecane': 'İzohekzadekan (Emolyent)',
  'isononyl-isononanoate': 'İzononil İzononanoat (Emolyent)',
  'ethylhexyl-palmitate': 'Etilheksil Palmitat (Emolyent)',
  'tridecane': 'Tridekan (Emolyent)',
  'dicaprylyl-ether': 'Dikaprilil Eter (Emolyent)',
  'isodecyl-neopentanoate': 'İzodecil Neopentanoat (Emolyent)',
  'palmitic-acid': 'Palmitik Asit (Yağ Asit)',
  'sorbitan-sesquioleate': 'Sorbitan Sesquioleat (Emülsifier)',
  'sorbitan-isostearate': 'Sorbitan İzostearat (Emülsifier)',
  'steareth-2': 'Stearet-2 (PEG\'lenmiş Yağ Alkolü)',

  // PEG / PPG / Polyglyceryl Grupları
  'peg-20-glyceryl-triisostearate': 'PEG-20 Gliseril Triizostearat (Emülsifier)',
  'peg-200-hydrogenated-glyceryl-palmate': 'PEG-200 Hidrojenize Gliseril Palmat (Emülsifier)',
  'peg-7-glyceryl-cocoate': 'PEG-7 Gliseril Kokoat (Emülsifier)',
  'peg-40-hydrogenated-castor-oil': 'PEG-40 Hidrojenize Hint Yağı (Emülsifier)',
  'peg-60-hydrogenated-castor-oil': 'PEG-60 Hidrojenize Hint Yağı (Emülsifier)',
  'ppg-26-buteth-26': 'PPG-26-Butet-26 (Solvent)',
  'polyglyceryl-2-stearate': 'Poligliseril-2 Stearat (Emülsifier)',
  'polyglyceryl-3-stearate': 'Poligliseril-3 Stearat (Emülsifier)',
  'polyglyceryl-6-laurate': 'Poligliseril-6 Laurat (Emülsifier)',
  'polyglyceryl-6-polyricinoleate': 'Poligliseril-6 Polirisinoleat (W/O Emülsifier)',
  'polyglyceryl-10-laurate': 'Poligliseril-10 Laurat (Emülsifier)',
  'polyglyceryl-3-methylglucose-distearate': 'Poligliseril-3 Metilglukoz Distearat (Emülsifier)',

  // Humektant / Solvent
  'methyl-gluceth-20': 'Metil Gluset-20 (Humektant)',
  'glycereth-26': 'Gliseret-26 (Humektant)',
  'hexylene-glycol': 'Hekzilen Glikol (Solvent / Koruyucu Booster)',
  'ethoxydiglycol': 'Etoksidiglikol (Solvent)',
  'dimethyl-isosorbide': 'Dimetil İzosorbid (Solvent)',

  // pH / Tampon
  'tromethamine': 'Trometamin (TRIS, pH Tampon)',
  'potassium-phosphate': 'Potasyum Fosfat (pH Tampon)',

  // Antiseptik / Şelat
  'chlorhexidine-digluconate': 'Klorheksidin Diglukonat (Antiseptik)',
  'trisodium-ethylenediamine-disuccinate': 'Trisodyum EDDS (Yeşil Şelat Ajan)',

  // Mineraller
  'manganese-gluconate': 'Manganez Glukonat (Mineral)',
  'manganese-pca': 'Manganez PCA (Mineral)',
  'sodium-chloride': 'Sodyum Klorür (Tuz, Kıvamlandırıcı)',
  'potassium-cetyl-phosphate': 'Potasyum Setil Fosfat (Emülsifier)',
  'sodium-lactate': 'Sodyum Laktat (Doğal Nemlendirici Faktör)',

  // Polimerler / Kıvamlandırıcı / Mikroplastik
  'hydroxyethylcellulose': 'Hidroksietilselüloz (Kıvamlandırıcı)',
  'microcrystalline-cellulose': 'Mikrokristalin Selüloz (Kıvamlandırıcı)',
  'polyacrylate-13': 'Poliakrilat-13 (Polimer Kıvamlandırıcı)',
  'polyethylene': 'Polietilen (Mikroplastik — AB\'de yıkamada yasak)',
  'polymethyl-methacrylate': 'Polimetil Metakrilat (PMMA Mikrobead)',
  'polyquaternium-10': 'Poliquaternium-10 (Saç Kondisyoner)',
  'bentonite': 'Bentonit (Doğal Mineral Kil)',

  // Diğer
  'pepsin': 'Pepsin (Enzim, Eksfoliyant)',
  'bromelain': 'Bromelain (Ananas Enzimi, Eksfoliyant)',
  'sucrose': 'Sakaroz (Şeker, Humektant)',
};

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let updated = 0, skipped = 0, missing = 0;
for (const [slug, name] of Object.entries(MAPPINGS)) {
  const r = await c.query(
    `UPDATE ingredients SET common_name = $2, updated_at = NOW()
     WHERE ingredient_slug = $1 AND (common_name IS NULL OR common_name = '')
     RETURNING ingredient_slug`,
    [slug, name]
  );
  if (r.rows.length) {
    updated++;
  } else {
    // varlığını kontrol et
    const exists = await c.query(`SELECT 1 FROM ingredients WHERE ingredient_slug = $1`, [slug]);
    if (exists.rows.length) {
      skipped++; // common_name zaten dolu
    } else {
      missing++;
      console.log(`✗ ${slug} → DB'de yok`);
    }
  }
}

console.log(`\nGüncellenen: ${updated} | Atlanmış (zaten dolu): ${skipped} | DB'de yok: ${missing}`);

// Final coverage rapor
const cov = await c.query(`
  SELECT
    COUNT(*) FILTER (WHERE common_name IS NOT NULL AND common_name != '') AS with_name,
    COUNT(*) FILTER (WHERE common_name IS NULL OR common_name = '') AS without_name,
    COUNT(*) AS total
  FROM ingredients i
  WHERE EXISTS (
    SELECT 1 FROM product_ingredients pi
    JOIN products p ON p.product_id = pi.product_id
    WHERE pi.ingredient_id = i.ingredient_id AND p.status IN ('published','active')
  )
`);
const cv = cov.rows[0];
const pct = ((cv.with_name / cv.total) * 100).toFixed(1);
console.log(`\nKULLANILAN INCI common_name kapsama: ${cv.with_name}/${cv.total} (%${pct})`);

await c.end();
