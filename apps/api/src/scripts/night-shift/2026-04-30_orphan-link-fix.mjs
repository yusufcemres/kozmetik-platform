// Tüm orphan product_ingredients (ingredient_id NULL) satırlarını ingredients tablosuna eşleştir
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

// Display name → slug normalizasyon
function nameToSlug(name) {
  return name.toLowerCase()
    .replace(/\([^)]*\)/g, '') // remove (active), (rice), etc.
    .replace(/\d+\s*%/g, '') // remove 10%
    .replace(/\//g, '-')
    .replace(/,/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Manuel override (otomatik eşleşmeyenler için)
const MANUAL_MAP = {
  'water': 'aqua',
  'aqua-water': 'aqua',
  'aqua-water-eau': 'aqua',
  'water-eau': 'aqua',
  'eau': 'aqua',
  'glycolipids': null, // bilinmiyor — yeni ingredient olarak eklenebilir veya skip
  'caprylic-capric-triglyceride': 'capryliccapric-triglyceride',
  'oryza-sativa-rice-extract': 'rice-extract',
  'oryza-sativa-extract': 'rice-extract',
  'oryza-sativa-rice-bran': 'rice-extract',
  'oryza-sativa-rice-hull-powder': 'rice-extract',
  'oryza-sativa-rice-lees-extract': 'rice-extract',
  'oryza-sativa-rice-seed-water': 'rice-extract',
  'avena-sativa-oat-meal-extract': null,
  'theobroma-cacao-cocoa-seed-extract': null,
  'elaeis-guineensis-palm-kernel-oil': 'elaeis-guineensis-oil',
  'epigallocatechin-gallatyl-glucoside-egcg': 'camellia-sinensis-leaf-extract',
  'aluminum-chlorohydrate': null,
  'ammonium-acryloyldimethyltaurate-vp-copolymer': null,
  'acrylates-c10-30-alkyl-acrylate-crosspolymer': null,
  'cellulose': 'hydroxyethyl-cellulose',
  'fructooligosaccharides': 'fructose',
  'lactobacillus-soybean-ferment-extract': 'lactobacillus-ferment',
  'palmitoyl-isoleucine': null,
  'magnesium-pca': 'magnesium-pca',
  'phytosteryl-canola-glycerides': null,
  'menthyl-lactate': null,
  'myristyl-glucoside': 'lauryl-glucoside', // glikozit ailesi
  'isosorbide-dicaprylate': null,
  'heptapeptide-6': 'peptide-complex',
  'honey': null,
  'honey-extract': null,
  'hippophae-rhamnoides-oil': 'sea-buckthorn-oil',
  'hexyl-nicotinate': 'niacin',
  'glycosphingolipids': 'sphingosine',
  'ethyl-linoleate': 'linoleic-acid',
  'ethylbisiminomethylguaiacol-manganese-chloride-euk-134': null,
  'dipotassium-glycyrrhizate': 'glycyrrhiza-glabra-root-extract',
  'coix-lacryma-jobi-ma-yuen-seed-extract': null,
  'coconut-alkanes': null,
  'coconut-acid': null,
  'coco-caprylate-caprate': 'capryliccapric-triglyceride',
  'cetyl-ethylhexanoate': null,
  'candida-bombicola-glucose-methyl-rapeseedate-ferment': 'saccharomyces-ferment',
  'camellia-sinensis-leaf-water': 'camellia-sinensis-leaf-extract',
  'c12-13-alkyl-glyceryl-hydrolyzed-hyaluronate': 'sodium-hyaluronate',
  '2-3-butanediol': 'butylene-glycol',
  '12-hexanediol': '12-hexanediol',
  'triethyl-citrate': null,
};

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Tüm slug'ları cache'le
const allSlugs = await c.query(`SELECT ingredient_id, ingredient_slug FROM ingredients`);
const slugMap = new Map(allSlugs.rows.map(r => [r.ingredient_slug, r.ingredient_id]));
console.log(`DB'de ${slugMap.size} ingredient mevcut.`);

// Orphan satırları al
const orphans = await c.query(`
  SELECT product_ingredient_id, ingredient_display_name
  FROM product_ingredients
  WHERE ingredient_id IS NULL
`);
console.log(`Orphan satır: ${orphans.rows.length}`);

let linked = 0, manualLinked = 0, unmatched = 0;
const unmatchedNames = new Set();

for (const r of orphans.rows) {
  const auto = nameToSlug(r.ingredient_display_name);

  let targetSlug = null;
  // 1. Doğrudan slug match
  if (slugMap.has(auto)) {
    targetSlug = auto;
  }
  // 2. Manuel mapping
  else if (auto in MANUAL_MAP) {
    const mapped = MANUAL_MAP[auto];
    if (mapped && slugMap.has(mapped)) {
      targetSlug = mapped;
      manualLinked++;
    }
  }

  if (targetSlug) {
    await c.query(
      `UPDATE product_ingredients SET ingredient_id = $1 WHERE product_ingredient_id = $2`,
      [slugMap.get(targetSlug), r.product_ingredient_id]
    );
    linked++;
  } else {
    unmatched++;
    unmatchedNames.add(r.ingredient_display_name);
  }
}

console.log(`\nLinked (toplam): ${linked} (manuel mapping ile: ${manualLinked})`);
console.log(`Eşleşmeyen orphan: ${unmatched}`);
if (unmatchedNames.size > 0) {
  console.log(`\nİlk 30 eşleşmeyen display_name:`);
  for (const n of [...unmatchedNames].slice(0, 30)) console.log(`  "${n}"`);
}

// Final orphan sayısı
const final = await c.query(`SELECT COUNT(*) FROM product_ingredients WHERE ingredient_id IS NULL`);
console.log(`\nKalan orphan: ${final.rows[0].count}`);

await c.end();
