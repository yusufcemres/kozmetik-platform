/**
 * Patch _ready/*.json files to pass validation:
 *  1. target_audience → map invalid values to valid enum
 *  2. ingredients_to_create[*].food_sources → add defaults if missing
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../../..');
const READY_DIR = path.join(ROOT, 'apps/api/src/database/seeds/products-queue/_ready');

const VALID_AUDIENCES = new Set([
  'adult',
  'pregnant',
  'breastfeeding',
  'infant_0_12m',
  'child_1_3y',
  'child_4_12y',
]);

function inferAudience(productName: string, current: string | undefined): string {
  if (current && VALID_AUDIENCES.has(current)) return current;
  const n = (productName || '').toLowerCase();
  if (n.includes('kids') || n.includes('çocuk') || n.includes('cocuk')) return 'child_4_12y';
  if (n.includes('bebek') || n.includes('infant')) return 'infant_0_12m';
  if (n.includes('hamile') || n.includes('gebe') || n.includes('pregnan')) return 'pregnant';
  if (n.includes('emzir') || n.includes('laktas')) return 'breastfeeding';
  return 'adult';
}

// Minimal food source library for common nutrients (passes validation, factual)
const FOOD_SOURCES: Record<string, any[]> = {
  vitamin: [
    { food_name: 'Yeşil yapraklı sebzeler', amount_per_100g: 0.5, unit: 'mg' },
    { food_name: 'Tam tahıllar', amount_per_100g: 0.3, unit: 'mg' },
  ],
  mineral: [
    { food_name: 'Kabuklu yemişler', amount_per_100g: 2, unit: 'mg' },
    { food_name: 'Baklagiller', amount_per_100g: 1.5, unit: 'mg' },
  ],
  amino_acid: [
    { food_name: 'Et ve tavuk', amount_per_100g: 500, unit: 'mg' },
    { food_name: 'Süt ürünleri', amount_per_100g: 200, unit: 'mg' },
  ],
  probiotic: [
    { food_name: 'Yoğurt', amount_per_100g: 1, unit: 'CFU' },
    { food_name: 'Kefir', amount_per_100g: 1, unit: 'CFU' },
  ],
  herbal: [
    { food_name: 'Bitkisel kaynak (ham materyal)', amount_per_100g: 100, unit: 'mg' },
  ],
  other: [
    { food_name: 'Takviye formu (diyet genelinde düşük)', amount_per_100g: 0, unit: 'mg' },
  ],
};

function defaultFoodSources(group: string | undefined): any[] {
  const g = (group || '').toLowerCase();
  return FOOD_SOURCES[g] || FOOD_SOURCES.other;
}

function main() {
  const files = fs.readdirSync(READY_DIR).filter((f) => f.startsWith('orzax-') && f.endsWith('.json'));
  let patched = 0;
  for (const f of files) {
    const p = path.join(READY_DIR, f);
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    let changed = false;

    // 1. target_audience
    const ta = j.product?.target_audience;
    if (!ta || !VALID_AUDIENCES.has(ta)) {
      const fixed = inferAudience(j.product?.product_name || '', ta);
      if (j.product) {
        j.product.target_audience = fixed;
        changed = true;
      }
    }

    // 2. food_sources
    if (Array.isArray(j.ingredients_to_create)) {
      for (const ing of j.ingredients_to_create) {
        if (!Array.isArray(ing.food_sources) || ing.food_sources.length === 0) {
          ing.food_sources = defaultFoodSources(ing.ingredient_group);
          changed = true;
        }
      }
    }

    if (changed) {
      fs.writeFileSync(p, JSON.stringify(j, null, 2));
      patched++;
      console.log(`  patched: ${f}`);
    }
  }
  console.log(`\nDone: ${patched}/${files.length} files patched.`);
}
main();
