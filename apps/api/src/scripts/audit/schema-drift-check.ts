/**
 * V2.A.1 — Schema drift audit.
 *
 * Compares the onboarding validator payload types (IngredientPayload,
 * ProductPayload) against the live entity @Column declarations. If a new
 * column lands on `ingredients` or `products` without being added to the
 * onboarding payload, this script flags it — the column is either:
 *   a) genuinely auto-populated (PK, timestamps) → add to the SKIP list
 *   b) should be onboard-able → extend the payload + atomic-insert
 *   c) was added for cosmetic-only and shouldn't be in supplement payload →
 *      document it here so the drift log stays clean.
 *
 * Usage:
 *   ts-node schema-drift-check.ts
 *   ts-node schema-drift-check.ts --fail-on-drift   # exit 2 if drift
 *
 * Zero external deps — regex parse is good enough: entities have a uniform
 * `@Column(...) fieldName: type;` grammar, and the validator payload types are
 * hand-written with a field per line.
 */
import * as fs from 'fs';
import * as path from 'path';

type Drift = {
  entity: 'ingredients' | 'products';
  column: string;
  note: string;
};

const REPO_ROOT = path.resolve(__dirname, '../../..');
const ENTITY_INGREDIENT = path.join(REPO_ROOT, 'src/database/entities/ingredient.entity.ts');
const ENTITY_PRODUCT = path.join(REPO_ROOT, 'src/database/entities/product.entity.ts');
const VALIDATORS = path.join(REPO_ROOT, 'src/scripts/onboarding/validators.ts');

// Columns auto-managed by the DB or the onboarding pipeline itself — never
// part of the JSON payload. Keep this list tight; everything else should be
// either onboarded or explicitly skipped with a reason.
const INGREDIENT_SKIP: Record<string, string> = {
  ingredient_id: 'PK',
  created_at: 'timestamp auto',
  updated_at: 'timestamp auto',
  is_active: 'always true on insert',
  bioavailability_score: 'auto-set via form_type mapping (enricher)',
  absorption_rate: 'derived',
  parent_ingredient_id: 'aliasing handled separately',
  // Cosmetic-only fields — validator doesn't cover them because supplement
  // onboarding ignores cosmetic regulatory columns.
  efficacy_conc_min: 'cosmetic-only',
  efficacy_conc_max: 'cosmetic-only',
  eu_annex_iii_limit: 'cosmetic-only',
  cir_status: 'cosmetic-only',
  sccs_opinion_ref: 'cosmetic-only',
  cmr_class: 'cosmetic-only',
  iarc_group: 'cosmetic-only',
  endocrine_flag: 'cosmetic-only',
  eu_banned: 'cosmetic-only',
  eu_restricted: 'cosmetic-only',
  allergen_flag: 'cosmetic-only',
  fragrance_flag: 'cosmetic-only',
  preservative_flag: 'cosmetic-only',
  origin_type: 'not onboarded (rarely known)',
  detailed_description: 'not onboarded — optional long-form, added later',
  sensitivity_note: 'not onboarded — rarely known at onboarding',
  safety_note: 'not onboarded — rarely known at onboarding',
  evidence_level: 'deprecated in favor of evidence_grade',
  daily_recommended_value: 'derived from effective_dose_min/max',
  daily_recommended_unit: 'derived from effective_dose_unit',
  ingredient_group: 'optional — validator does a soft-check when present',
};

const PRODUCT_SKIP: Record<string, string> = {
  product_id: 'PK',
  variant_id: 'nullable FK, set via dedupe path',
  brand_id: 'resolved from brand_slug in Stage 0',
  category_id: 'resolved from category_slug in Stage 0',
  created_at: 'timestamp auto',
  updated_at: 'timestamp auto',
  domain_type: 'hardcoded to supplement in Stage 3',
  status: "hardcoded to 'draft' in Stage 3",
  view_count: 'runtime counter',
  favorite_count: 'runtime counter',
  top_need_name: 'derived from scoring',
  top_need_score: 'derived from scoring',
  product_slug: 'generated from product_name via slugify',
  product_type_label: 'not onboarded (rarely set for supplements)',
  target_area: 'cosmetic-only',
  usage_time_hint: 'cosmetic-only',
  target_gender: 'not onboarded currently',
  barcode: 'not onboarded (optional)',
};

function extractColumns(filePath: string): string[] {
  const src = fs.readFileSync(filePath, 'utf-8');
  const cols: string[] = [];
  // Matches `@Column(...)\n<modifiers>  fieldName: Type`. We anchor on the
  // @Column line and grab the next identifier-looking line.
  const re = /@Column\([^)]*\)[\s\S]*?^\s*([a-z_][a-z0-9_]*)\s*[?:!]/gim;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) cols.push(m[1]);
  return [...new Set(cols)];
}

function extractPayloadFields(typeName: string, src: string): string[] {
  const start = src.indexOf(`export type ${typeName} = {`);
  if (start === -1) return [];
  const end = src.indexOf('};', start);
  if (end === -1) return [];
  const body = src.slice(start, end);
  const fields: string[] = [];
  const re = /^\s*([a-z_][a-z0-9_]*)\s*\??\s*:/gim;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) fields.push(m[1]);
  return fields;
}

function diff(
  entityName: 'ingredients' | 'products',
  columns: string[],
  payloadFields: string[],
  skip: Record<string, string>,
): Drift[] {
  const payload = new Set(payloadFields);
  const drifts: Drift[] = [];
  for (const col of columns) {
    if (payload.has(col)) continue;
    if (skip[col]) continue;
    drifts.push({ entity: entityName, column: col, note: '— validator payload kapsamıyor, SKIP listesinde de yok.' });
  }
  return drifts;
}

function main(): void {
  const failOnDrift = process.argv.includes('--fail-on-drift');
  const vsrc = fs.readFileSync(VALIDATORS, 'utf-8');

  const ingCols = extractColumns(ENTITY_INGREDIENT);
  const prodCols = extractColumns(ENTITY_PRODUCT);
  const ingPayload = extractPayloadFields('IngredientPayload', vsrc);
  const prodPayload = extractPayloadFields('ProductPayload', vsrc);

  console.log('🔎 Schema drift audit\n');
  console.log(`  ingredients: ${ingCols.length} column, validator IngredientPayload: ${ingPayload.length} field`);
  console.log(`  products   : ${prodCols.length} column, validator ProductPayload   : ${prodPayload.length} field\n`);

  const drifts = [
    ...diff('ingredients', ingCols, ingPayload, INGREDIENT_SKIP),
    ...diff('products', prodCols, prodPayload, PRODUCT_SKIP),
  ];

  if (drifts.length === 0) {
    console.log('✅ Drift yok — entity ve validator senkron.');
    return;
  }

  console.log(`⚠️  ${drifts.length} drift tespit edildi:\n`);
  for (const d of drifts) {
    console.log(`  • ${d.entity}.${d.column} ${d.note}`);
  }
  console.log(`\nDüzeltme yolları:`);
  console.log(`  1) Kolon gerçekten onboard edilmeliyse → validators.ts payload type'a ekle + atomic-insert.ts INSERT'e ekle`);
  console.log(`  2) Otomatik doluyorsa (derived/timestamp/runtime) → schema-drift-check.ts SKIP map'ine ekle, sebep yaz`);
  console.log(`  3) Cosmetic-only bir kolon ise → SKIP map'inde 'cosmetic-only' olarak işaretle\n`);

  if (failOnDrift) process.exit(2);
}

main();
