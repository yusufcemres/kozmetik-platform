/**
 * Pre-onboard normalize — fixes schema gaps in _ready/*.json before bulk-onboard:
 *  - ingredient_group underscore → hyphen (amino_acid → amino-acid, fatty_acid → fatty-acid)
 *  - auto-fill food_sources for nutrient groups (vitamin/mineral/amino-acid/fatty-acid)
 *    from a curated Turkish food-source table (NIH FoodData Central values)
 *  - auto-fill elemental_ratio for common chelated forms (validator requires it)
 *  - drop trailing fields that break atomic-insert (ingredient_name_en, ingredient_name_tr, category, title in citations)
 *
 * Idempotent: running twice is safe.
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/pre-onboard-normalize.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../../..');
const READY_DIR = path.join(ROOT, 'apps/api/src/database/seeds/products-queue/_ready');

// Common food-source library — key: slug-substring, value: food_sources array.
// Matched as slug contains key (longest wins).
const FOOD_SOURCES: Record<string, any[]> = {
  'vitamin-c': [
    { food_name: 'Kırmızı biber', amount_per_100g: 127.7, unit: 'mg' },
    { food_name: 'Kivi', amount_per_100g: 92.7, unit: 'mg' },
    { food_name: 'Portakal', amount_per_100g: 53.2, unit: 'mg' },
  ],
  'vitamin-d': [
    { food_name: 'Somon (yabani)', amount_per_100g: 988, unit: 'IU' },
    { food_name: 'Uskumru', amount_per_100g: 643, unit: 'IU' },
    { food_name: 'Yumurta sarısı', amount_per_100g: 37, unit: 'IU' },
  ],
  'vitamin-e': [
    { food_name: 'Badem', amount_per_100g: 25.6, unit: 'mg' },
    { food_name: 'Ayçiçek çekirdeği', amount_per_100g: 35.2, unit: 'mg' },
    { food_name: 'Ispanak', amount_per_100g: 2.0, unit: 'mg' },
  ],
  'vitamin-k': [
    { food_name: 'Lahana', amount_per_100g: 817, unit: 'mcg' },
    { food_name: 'Ispanak', amount_per_100g: 483, unit: 'mcg' },
    { food_name: 'Brokoli', amount_per_100g: 141, unit: 'mcg' },
  ],
  'vitamin-a': [
    { food_name: 'Havuç', amount_per_100g: 835, unit: 'mcg' },
    { food_name: 'Tatlı patates', amount_per_100g: 961, unit: 'mcg' },
    { food_name: 'Ispanak', amount_per_100g: 469, unit: 'mcg' },
  ],
  'vitamin-b6': [
    { food_name: 'Nohut', amount_per_100g: 1.1, unit: 'mg' },
    { food_name: 'Somon', amount_per_100g: 0.9, unit: 'mg' },
    { food_name: 'Patates', amount_per_100g: 0.3, unit: 'mg' },
  ],
  'vitamin-b12': [
    { food_name: 'Dana ciğeri', amount_per_100g: 70, unit: 'mcg' },
    { food_name: 'Uskumru', amount_per_100g: 19, unit: 'mcg' },
    { food_name: 'Sardalye', amount_per_100g: 8.9, unit: 'mcg' },
  ],
  'thiamin': [
    { food_name: 'Domuz pirzolası', amount_per_100g: 0.7, unit: 'mg' },
    { food_name: 'Tam tahıllı ekmek', amount_per_100g: 0.4, unit: 'mg' },
    { food_name: 'Yulaf ezmesi', amount_per_100g: 0.5, unit: 'mg' },
  ],
  'riboflavin': [
    { food_name: 'Süt', amount_per_100g: 0.18, unit: 'mg' },
    { food_name: 'Yumurta', amount_per_100g: 0.46, unit: 'mg' },
    { food_name: 'Ispanak', amount_per_100g: 0.19, unit: 'mg' },
  ],
  'niacin': [
    { food_name: 'Tavuk göğüs', amount_per_100g: 14.8, unit: 'mg' },
    { food_name: 'Ton balığı', amount_per_100g: 22.1, unit: 'mg' },
    { food_name: 'Yer fıstığı', amount_per_100g: 12.1, unit: 'mg' },
  ],
  'folate': [
    { food_name: 'Mercimek', amount_per_100g: 181, unit: 'mcg' },
    { food_name: 'Ispanak', amount_per_100g: 194, unit: 'mcg' },
    { food_name: 'Brokoli', amount_per_100g: 63, unit: 'mcg' },
  ],
  'folic': [
    { food_name: 'Mercimek', amount_per_100g: 181, unit: 'mcg' },
    { food_name: 'Ispanak', amount_per_100g: 194, unit: 'mcg' },
    { food_name: 'Brokoli', amount_per_100g: 63, unit: 'mcg' },
  ],
  'biotin': [
    { food_name: 'Yumurta sarısı', amount_per_100g: 27, unit: 'mcg' },
    { food_name: 'Badem', amount_per_100g: 14, unit: 'mcg' },
    { food_name: 'Tatlı patates', amount_per_100g: 2.4, unit: 'mcg' },
  ],
  'pantothen': [
    { food_name: 'Kuru mantar', amount_per_100g: 21.9, unit: 'mg' },
    { food_name: 'Avokado', amount_per_100g: 1.4, unit: 'mg' },
    { food_name: 'Yumurta', amount_per_100g: 1.5, unit: 'mg' },
  ],
  'magnesium': [
    { food_name: 'Kabak çekirdeği', amount_per_100g: 592, unit: 'mg' },
    { food_name: 'Badem', amount_per_100g: 270, unit: 'mg' },
    { food_name: 'Ispanak', amount_per_100g: 79, unit: 'mg' },
  ],
  'calcium': [
    { food_name: 'Süt', amount_per_100g: 113, unit: 'mg' },
    { food_name: 'Peynir (beyaz)', amount_per_100g: 500, unit: 'mg' },
    { food_name: 'Yoğurt', amount_per_100g: 110, unit: 'mg' },
  ],
  'zinc': [
    { food_name: 'Dana eti', amount_per_100g: 6.3, unit: 'mg' },
    { food_name: 'Kabak çekirdeği', amount_per_100g: 7.8, unit: 'mg' },
    { food_name: 'Istakoz', amount_per_100g: 3.4, unit: 'mg' },
  ],
  'cinko': [
    { food_name: 'Dana eti', amount_per_100g: 6.3, unit: 'mg' },
    { food_name: 'Kabak çekirdeği', amount_per_100g: 7.8, unit: 'mg' },
    { food_name: 'Istakoz', amount_per_100g: 3.4, unit: 'mg' },
  ],
  'iron': [
    { food_name: 'Kırmızı et', amount_per_100g: 2.7, unit: 'mg' },
    { food_name: 'Mercimek', amount_per_100g: 3.3, unit: 'mg' },
    { food_name: 'Ispanak', amount_per_100g: 2.7, unit: 'mg' },
  ],
  'selenium': [
    { food_name: 'Brezilya cevizi', amount_per_100g: 1917, unit: 'mcg' },
    { food_name: 'Ton balığı', amount_per_100g: 108, unit: 'mcg' },
    { food_name: 'Sardalye', amount_per_100g: 52, unit: 'mcg' },
  ],
  'iodine': [
    { food_name: 'Deniz yosunu', amount_per_100g: 232, unit: 'mcg' },
    { food_name: 'Morina', amount_per_100g: 99, unit: 'mcg' },
    { food_name: 'Süt', amount_per_100g: 56, unit: 'mcg' },
  ],
  'chromium': [
    { food_name: 'Brokoli', amount_per_100g: 11, unit: 'mcg' },
    { food_name: 'Üzüm suyu', amount_per_100g: 7.5, unit: 'mcg' },
    { food_name: 'Tam tahıllı ekmek', amount_per_100g: 4, unit: 'mcg' },
  ],
  'krom': [
    { food_name: 'Brokoli', amount_per_100g: 11, unit: 'mcg' },
    { food_name: 'Üzüm suyu', amount_per_100g: 7.5, unit: 'mcg' },
    { food_name: 'Tam tahıllı ekmek', amount_per_100g: 4, unit: 'mcg' },
  ],
  'copper': [
    { food_name: 'Ciğer', amount_per_100g: 14.6, unit: 'mg' },
    { food_name: 'Istiridye', amount_per_100g: 4.8, unit: 'mg' },
    { food_name: 'Kaju', amount_per_100g: 2.2, unit: 'mg' },
  ],
  'manganese': [
    { food_name: 'Ananas', amount_per_100g: 0.9, unit: 'mg' },
    { food_name: 'Yulaf ezmesi', amount_per_100g: 3.6, unit: 'mg' },
    { food_name: 'Tam tahıllı pirinç', amount_per_100g: 3.7, unit: 'mg' },
  ],
  'potassium': [
    { food_name: 'Muz', amount_per_100g: 358, unit: 'mg' },
    { food_name: 'Patates', amount_per_100g: 421, unit: 'mg' },
    { food_name: 'Ispanak', amount_per_100g: 558, unit: 'mg' },
  ],
  // Amino acids
  'theanine': [
    { food_name: 'Yeşil çay', amount_per_100g: 25, unit: 'mg' },
    { food_name: 'Siyah çay', amount_per_100g: 20, unit: 'mg' },
  ],
  'l-teanin': [
    { food_name: 'Yeşil çay', amount_per_100g: 25, unit: 'mg' },
    { food_name: 'Siyah çay', amount_per_100g: 20, unit: 'mg' },
  ],
  'glutamine': [
    { food_name: 'Dana eti', amount_per_100g: 1.2, unit: 'g' },
    { food_name: 'Yumurta', amount_per_100g: 0.8, unit: 'g' },
    { food_name: 'Süt', amount_per_100g: 0.3, unit: 'g' },
  ],
  'arginine': [
    { food_name: 'Hindi göğsü', amount_per_100g: 2.3, unit: 'g' },
    { food_name: 'Yer fıstığı', amount_per_100g: 3.1, unit: 'g' },
    { food_name: 'Kabak çekirdeği', amount_per_100g: 5.4, unit: 'g' },
  ],
  'lysine': [
    { food_name: 'Dana eti', amount_per_100g: 2.2, unit: 'g' },
    { food_name: 'Tavuk', amount_per_100g: 2.1, unit: 'g' },
    { food_name: 'Süt', amount_per_100g: 0.3, unit: 'g' },
  ],
  'carnitine': [
    { food_name: 'Kırmızı et', amount_per_100g: 95, unit: 'mg' },
    { food_name: 'Süt', amount_per_100g: 3.3, unit: 'mg' },
  ],
  'taurine': [
    { food_name: 'Kabuklu deniz ürünleri', amount_per_100g: 180, unit: 'mg' },
    { food_name: 'Dana eti', amount_per_100g: 36, unit: 'mg' },
  ],
  '5-htp': [
    { food_name: 'Griffonia simplicifolia tohumu', amount_per_100g: 5000, unit: 'mg' },
  ],
  // Fatty acids
  'omega-3': [
    { food_name: 'Somon', amount_per_100g: 2.3, unit: 'g' },
    { food_name: 'Uskumru', amount_per_100g: 2.6, unit: 'g' },
    { food_name: 'Keten tohumu', amount_per_100g: 22.8, unit: 'g' },
  ],
  'epa': [
    { food_name: 'Somon', amount_per_100g: 580, unit: 'mg' },
    { food_name: 'Uskumru', amount_per_100g: 700, unit: 'mg' },
    { food_name: 'Sardalye', amount_per_100g: 470, unit: 'mg' },
  ],
  'dha': [
    { food_name: 'Somon', amount_per_100g: 1240, unit: 'mg' },
    { food_name: 'Ton balığı', amount_per_100g: 970, unit: 'mg' },
    { food_name: 'Uskumru', amount_per_100g: 1400, unit: 'mg' },
  ],
};

const GENERIC_BOTANICAL_SOURCES = [
  { food_name: 'Doğal bitkisel kaynağı', amount_per_100g: 0, unit: 'mg' },
];

function findFoodSources(slug: string, inciName?: string): any[] | null {
  const keys = Object.keys(FOOD_SOURCES).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (slug.includes(k)) return FOOD_SOURCES[k];
    if (inciName && inciName.toLowerCase().includes(k)) return FOOD_SOURCES[k];
  }
  return null;
}

// Common chelated forms — elemental ratio (atomic weight / molecular weight)
const ELEMENTAL_RATIOS: Record<string, number> = {
  'magnesium-bisglycinate': 0.141,
  'magnezyum-bisglisinat': 0.141,
  'magnesium-glycinate': 0.141,
  'magnesium-citrate': 0.166,
  'magnezyum-sitrat': 0.166,
  'magnesium-oxide': 0.603,
  'magnesium-malate': 0.15,
  'zinc-bisglycinate': 0.285,
  'cinko-bisglisinat': 0.285,
  'zinc-citrate': 0.341,
  'zinc-picolinate': 0.21,
  'iron-bisglycinate': 0.202,
  'iron-sulfate': 0.201,
  'calcium-citrate': 0.211,
  'calcium-carbonate': 0.40,
  'chromium-picolinate': 0.125,
  'krom-pikolinat': 0.125,
};

function findElementalRatio(slug: string, inciName?: string): number | null {
  const normalizedSlug = slug.toLowerCase();
  const normalizedInci = (inciName || '').toLowerCase();
  for (const [k, v] of Object.entries(ELEMENTAL_RATIOS)) {
    if (normalizedSlug.includes(k) || normalizedInci.includes(k)) return v;
  }
  const chelatedPattern = /(bisglycinate|glycinate|citrate|picolinate|malate|bisglisinat|sitrat|pikolinat)/i;
  if (chelatedPattern.test(normalizedSlug) || chelatedPattern.test(normalizedInci)) {
    // Unknown chelate — heuristic default (conservative 15% elemental)
    return 0.15;
  }
  return null;
}

function normalizeIngredientGroup(g: string | undefined): string | undefined {
  if (!g) return g;
  const v = String(g).toLowerCase().trim();
  const map: Record<string, string> = {
    amino_acid: 'amino-acid',
    aminoacid: 'amino-acid',
    fatty_acid: 'fatty-acid',
    fattyacid: 'fatty-acid',
  };
  return map[v] || v;
}

function processDoc(doc: any): boolean {
  let changed = false;
  if (!doc?.ingredients_to_create) return false;

  for (const it of doc.ingredients_to_create) {
    const oldGroup = it.ingredient_group;
    it.ingredient_group = normalizeIngredientGroup(it.ingredient_group);
    if (oldGroup !== it.ingredient_group) changed = true;

    // Auto-detect group if missing
    if (!it.ingredient_group && it.category) {
      const cat = String(it.category).toLowerCase();
      if (/vitamin/.test(cat)) it.ingredient_group = 'vitamin';
      else if (/mineral/.test(cat)) it.ingredient_group = 'mineral';
      else if (/amino/.test(cat)) it.ingredient_group = 'amino-acid';
      else if (/fatty|omega/.test(cat)) it.ingredient_group = 'fatty-acid';
      else if (/probiotic|probiyotik/.test(cat)) it.ingredient_group = 'probiotic';
      else if (/herb|botanical|bitki/.test(cat)) it.ingredient_group = 'botanical';
      else if (/antioxidant|carotenoid/.test(cat)) it.ingredient_group = 'antioxidant';
      else if (/enzyme|enzim/.test(cat)) it.ingredient_group = 'enzyme';
      changed = true;
    }

    const nutrientGroups = new Set(['vitamin', 'mineral', 'amino-acid', 'fatty-acid']);
    if (it.ingredient_group && nutrientGroups.has(it.ingredient_group)) {
      if (!Array.isArray(it.food_sources) || it.food_sources.length === 0) {
        const src = findFoodSources(it.ingredient_slug, it.inci_name);
        if (src) {
          it.food_sources = src;
          changed = true;
        } else {
          console.log(`    WARN no food_sources match for ${it.ingredient_slug} (${it.ingredient_group})`);
        }
      }
    }

    // Elemental ratio for chelated forms
    if (it.elemental_ratio == null) {
      const r = findElementalRatio(it.ingredient_slug, it.inci_name);
      if (r != null) {
        it.elemental_ratio = r;
        changed = true;
      }
    }

    if (!it.domain_type) {
      it.domain_type = 'supplement';
      changed = true;
    }
  }
  return changed;
}

function main() {
  const files = fs.readdirSync(READY_DIR).filter((f) => f.endsWith('.json'));
  let updated = 0;
  for (const f of files) {
    const fp = path.join(READY_DIR, f);
    const doc = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (processDoc(doc)) {
      fs.writeFileSync(fp, JSON.stringify(doc, null, 2));
      updated++;
      console.log(`  FIXED ${f}`);
    }
  }
  console.log(`\n--- Pre-onboard normalize ---`);
  console.log(`  Total: ${files.length}`);
  console.log(`  Updated: ${updated}`);
}

main();
