/**
 * Faz A — Ingredient DB enrichment (kural bazlı, offline)
 *
 * Migration 009 ile eklenen kolonları INCI isim örüntüleriyle doldurur.
 * Dış API çağrısı yok — CosIng / Paula's / PubChem kaynaklarından
 * türetilmiş offline kural setleri kullanılır.
 *
 * Kurallar konservatif: emin olunmayan durumlarda false/null bırakılır.
 * Emin olunan tag'ler için enrichment_source = 'inci_rules_v1' set edilir.
 *
 * Calistir: node enrich-ingredients.js [--dry-run]
 */
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }

const DRY = process.argv.includes('--dry-run');

// --- Kural setleri -----------------------------------------------------

// Parabenler (hepsi C[n]H[n]O3 ester yapısı, Leaping Bunny + CosIng listesi)
const PARABENS = [
  'methylparaben', 'ethylparaben', 'propylparaben', 'butylparaben',
  'isobutylparaben', 'isopropylparaben', 'benzylparaben', 'pentylparaben',
];

// Silikonlar — -cone, -siloxane, -silanol sonekleri + tanınan özel isimler
const SILICONE_SUFFIX = /(cone|siloxane|silanol|silsesquioxane|silicate|silylate)$/i;
const SILICONE_KNOWN = ['dimethicone', 'cyclopentasiloxane', 'cyclohexasiloxane', 'phenyl trimethicone'];

// Sülfatlar — SLS / SLES / ALS / ALES
const SULFATES = [
  'sodium lauryl sulfate', 'sodium laureth sulfate', 'ammonium lauryl sulfate',
  'ammonium laureth sulfate', 'sodium myreth sulfate', 'sodium coco-sulfate',
  'tea-lauryl sulfate',
];

// PEG — "peg-" ile başlayan her şey
const PEG_PREFIX = /^peg[- ]?\d+/i;
const PEG_RELATED = ['peg', 'ppg', 'polyethylene glycol', 'polypropylene glycol', 'ceteareth', 'laureth', 'steareth', 'oleth'];

// Mineral yağ türevleri
const MINERAL_OIL = [
  'mineral oil', 'paraffinum liquidum', 'petrolatum', 'paraffin', 'cera microcristallina',
  'microcrystalline wax', 'ozokerite', 'ceresin', 'isoparaffin',
];

// Hayvan kaynaklı (INCI-bazlı konservatif set — lanolin vegan degil, beeswax vegan degil)
const ANIMAL_DERIVED = [
  'lanolin', 'beeswax', 'cera alba', 'cera flava', 'honey', 'mel',
  'carmine', 'ci 75470', 'guanine', 'collagen', 'keratin',
  'silk powder', 'sericin', 'snail secretion filtrate', 'tallow',
  'cholesterol', 'squalene', // squalane synthetic olabilir; squalene olivden de gelebilir ama INCI'de belirtilmezse riskli
];

// EU Cosmetics Regulation 1223/2009 Annex III — 26 fragrance allergen
const EU26_ALLERGENS = [
  'amyl cinnamal', 'amylcinnamyl alcohol', 'anisyl alcohol', 'benzyl alcohol',
  'benzyl benzoate', 'benzyl cinnamate', 'benzyl salicylate', 'cinnamal',
  'cinnamyl alcohol', 'citral', 'citronellol', 'coumarin',
  'eugenol', 'farnesol', 'geraniol', 'hexyl cinnamal',
  'hydroxycitronellal', 'hydroxyisohexyl 3-cyclohexene carboxaldehyde',
  'isoeugenol', 'limonene', 'linalool', 'methyl 2-octynoate',
  'alpha-isomethyl ionone', 'evernia prunastri', 'evernia furfuracea',
  'butylphenyl methylpropional',
];

// Kurutucu alkoller (drying) — cetyl/stearyl gibi fatty alcohol HARIÇ
const DRYING_ALCOHOLS = [
  'alcohol denat', 'denatured alcohol', 'alcohol denatured',
  'sd alcohol', 'isopropyl alcohol', 'isopropanol',
  'ethanol', 'methanol',
];
// 'alcohol' tek başına → çoğunlukla denat, ama test için 'cetyl alcohol' gibi fatty olanlar muaf
const FATTY_ALCOHOL_WHITELIST = ['cetyl alcohol', 'cetearyl alcohol', 'stearyl alcohol', 'behenyl alcohol', 'myristyl alcohol', 'lauryl alcohol'];

// Komedojenik skorlar (Paula's Choice + Acne.org consensus, 0-5)
const COMEDOGENIC = {
  'coconut oil': 4, 'cocos nucifera oil': 4,
  'isopropyl myristate': 5, 'isopropyl palmitate': 4,
  'myristyl myristate': 5, 'isostearyl neopentanoate': 3,
  'lanolin': 2, 'cocoa butter': 4, 'theobroma cacao seed butter': 4,
  'wheat germ oil': 5, 'flaxseed oil': 4, 'linum usitatissimum seed oil': 4,
  'avocado oil': 2, 'persea gratissima oil': 2,
  'olive oil': 2, 'olea europaea fruit oil': 2,
  'shea butter': 0, 'butyrospermum parkii butter': 0,
  'jojoba oil': 2, 'simmondsia chinensis seed oil': 2,
  'argan oil': 0, 'argania spinosa kernel oil': 0,
  'squalane': 1, 'hemisqualane': 0,
  'rosehip oil': 1, 'rosa canina fruit oil': 1,
  'sunflower oil': 0, 'helianthus annuus seed oil': 0,
  'castor oil': 1, 'ricinus communis seed oil': 1,
  'mineral oil': 2, 'petrolatum': 0,
  'dimethicone': 1,
  'sodium lauryl sulfate': 5,
  'algae extract': 5, 'laminaria digitata extract': 5,
};

// --- Eşleştirici --------------------------------------------------------

function enrich(inciRaw) {
  const inci = (inciRaw || '').toLowerCase().trim();
  if (!inci) return null;

  const out = {
    is_paraben: false,
    is_silicone: false,
    is_sulfate: false,
    is_peg: false,
    is_mineral_oil: false,
    is_animal_derived: false,
    is_eu26_allergen: false,
    is_alcohol_drying: false,
    comedogenic_score: null,
    ingredient_function: null,
    touched: false,
  };

  if (PARABENS.some(p => inci === p || inci.includes(p))) { out.is_paraben = true; out.ingredient_function = 'preservative'; out.touched = true; }
  if (SILICONE_KNOWN.some(s => inci.includes(s)) || SILICONE_SUFFIX.test(inci)) { out.is_silicone = true; out.ingredient_function = out.ingredient_function || 'emollient'; out.touched = true; }
  if (SULFATES.some(s => inci === s || inci.includes(s))) { out.is_sulfate = true; out.ingredient_function = 'surfactant'; out.touched = true; }
  if (PEG_PREFIX.test(inci) || PEG_RELATED.some(p => inci.startsWith(p + '-') || inci === p)) { out.is_peg = true; out.touched = true; }
  if (MINERAL_OIL.some(m => inci === m || inci.includes(m))) { out.is_mineral_oil = true; out.ingredient_function = 'occlusive'; out.touched = true; }
  if (ANIMAL_DERIVED.some(a => inci === a || inci.includes(a))) { out.is_animal_derived = true; out.touched = true; }
  if (EU26_ALLERGENS.some(a => inci === a || inci.includes(a))) { out.is_eu26_allergen = true; out.touched = true; }

  // Drying alcohol — fatty whitelist check
  const isFatty = FATTY_ALCOHOL_WHITELIST.some(f => inci.includes(f));
  if (!isFatty && DRYING_ALCOHOLS.some(d => inci === d || inci.startsWith(d))) {
    out.is_alcohol_drying = true;
    out.touched = true;
  }

  for (const [k, v] of Object.entries(COMEDOGENIC)) {
    if (inci === k || inci.includes(k)) { out.comedogenic_score = v; out.touched = true; break; }
  }

  return out;
}

// --- Main ---------------------------------------------------------------

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const { rows } = await client.query(`SELECT ingredient_id, inci_name FROM ingredients WHERE is_active = true`);
  console.log(`${rows.length} ingredient bulundu`);

  let touched = 0;
  const stats = { paraben: 0, silicone: 0, sulfate: 0, peg: 0, mineral_oil: 0, animal: 0, eu26: 0, drying: 0, comedogenic: 0 };

  for (const r of rows) {
    const e = enrich(r.inci_name);
    if (!e || !e.touched) continue;
    touched++;
    if (e.is_paraben) stats.paraben++;
    if (e.is_silicone) stats.silicone++;
    if (e.is_sulfate) stats.sulfate++;
    if (e.is_peg) stats.peg++;
    if (e.is_mineral_oil) stats.mineral_oil++;
    if (e.is_animal_derived) stats.animal++;
    if (e.is_eu26_allergen) stats.eu26++;
    if (e.is_alcohol_drying) stats.drying++;
    if (e.comedogenic_score !== null) stats.comedogenic++;

    if (!DRY) {
      await client.query(
        `UPDATE ingredients SET
          is_paraben = $1, is_silicone = $2, is_sulfate = $3, is_peg = $4,
          is_mineral_oil = $5, is_animal_derived = $6, is_eu26_allergen = $7,
          is_alcohol_drying = $8, comedogenic_score = $9,
          ingredient_function = COALESCE($10, ingredient_function),
          enrichment_source = 'inci_rules_v1'
         WHERE ingredient_id = $11`,
        [e.is_paraben, e.is_silicone, e.is_sulfate, e.is_peg,
         e.is_mineral_oil, e.is_animal_derived, e.is_eu26_allergen,
         e.is_alcohol_drying, e.comedogenic_score, e.ingredient_function,
         r.ingredient_id]
      );
    }
  }

  console.log(`\nİşlenen: ${touched}/${rows.length}`);
  console.log('Dağılım:', stats);
  if (DRY) console.log('\n[DRY RUN — DB yazılmadı]');

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
