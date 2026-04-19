/**
 * Backfill tool — UPDATE an existing ingredient from a manual JSON patch file.
 *
 * Use this to fix audit findings without re-running the full onboarding
 * pipeline. Intended flow:
 *   1. `find-missing-ingredient-data.ts` listeler eksikleri
 *   2. Kullanıcı `research-ingredient.ts` ile taslak üretir (opsiyonel)
 *   3. Kullanıcı backfill dosyası yazar (aynı ingredients_to_create şeması)
 *   4. `backfill-from-json.ts patches/foo.json` → ingredients tablosunda UPDATE
 *
 * The JSON file contains a single object OR an array of ingredient payloads.
 * Each payload MUST have `ingredient_slug`; other fields are optional and only
 * updated if present (partial patch).
 *
 * Usage: ts-node backfill-from-json.ts <patch.json> [--dry-run]
 */
import * as fs from 'fs';
import * as path from 'path';
import { newClient } from '../onboarding/db';
import { validateIngredient, formatErrors } from '../onboarding/validators';
import type { IngredientPayload } from '../onboarding/validators';
import { detectElementalRatio } from '../onboarding/enrichers/elemental-detect';

const PATCHABLE_FIELDS: (keyof IngredientPayload)[] = [
  'inci_name',
  'common_name',
  'function_summary',
  'evidence_grade',
  'evidence_citations',
  'effective_dose_min',
  'effective_dose_max',
  'effective_dose_unit',
  'ul_dose',
  'elemental_ratio',
  'form_type',
  'bioavailability_score',
  'safety_class',
  'food_sources',
];

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const filePath = argv.find((a) => !a.startsWith('--'));
  const dry = argv.includes('--dry-run');
  if (!filePath) {
    console.error('Kullanım: backfill-from-json.ts <patch.json> [--dry-run]');
    process.exit(1);
  }
  const abs = path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(abs, 'utf-8');
  const parsed: unknown = JSON.parse(raw);
  const patches: IngredientPayload[] = Array.isArray(parsed) ? (parsed as IngredientPayload[]) : [parsed as IngredientPayload];

  const client = newClient();
  await client.connect();
  try {
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < patches.length; i++) {
      const p = patches[i];
      if (!p?.ingredient_slug) {
        errors.push(`[${i}] ingredient_slug eksik.`);
        continue;
      }

      // Read current row
      const cur = await client.query(`SELECT * FROM ingredients WHERE ingredient_slug=$1`, [p.ingredient_slug]);
      if (cur.rowCount === 0) {
        errors.push(`[${p.ingredient_slug}] DB'de yok — yeni ingredient eklemek için onboarding pipeline kullan.`);
        continue;
      }
      const curRow = cur.rows[0];

      // Merge: patch fields over current row for validator run
      const merged: IngredientPayload = { ...curRow, ...p } as IngredientPayload;

      // Auto-fill elemental_ratio if chelated and missing
      if (merged.elemental_ratio == null) {
        const el = detectElementalRatio(merged);
        if (el.action === 'kept') {
          merged.elemental_ratio = el.ratio;
          p.elemental_ratio = el.ratio;
        }
      }

      const errs = validateIngredient(merged, i);
      if (errs.length > 0) {
        errors.push(`[${p.ingredient_slug}] validator fail:\n${formatErrors(errs)}`);
        continue;
      }

      // Build UPDATE SET clause dynamically
      const sets: string[] = [];
      const vals: unknown[] = [];
      let idx = 1;
      for (const f of PATCHABLE_FIELDS) {
        if (p[f] === undefined) continue;
        if (f === 'evidence_citations' || f === 'food_sources') {
          sets.push(`${f} = $${idx}::jsonb`);
          vals.push(JSON.stringify(p[f]));
        } else {
          sets.push(`${f} = $${idx}`);
          vals.push(p[f]);
        }
        idx++;
      }
      if (sets.length === 0) {
        skipped++;
        continue;
      }
      sets.push(`updated_at = now()`);
      vals.push(p.ingredient_slug);
      const sql = `UPDATE ingredients SET ${sets.join(', ')} WHERE ingredient_slug = $${idx}`;

      if (dry) {
        console.log(`[DRY] ${p.ingredient_slug}: ${sets.length - 1} alan güncellenecek.`);
      } else {
        await client.query(sql, vals);
        console.log(`[UPD] ${p.ingredient_slug}: ${sets.length - 1} alan güncellendi.`);
      }
      updated++;
    }

    console.log(`\n─── Summary ───`);
    console.log(`  updated : ${updated}`);
    console.log(`  skipped : ${skipped}`);
    console.log(`  errors  : ${errors.length}`);
    if (errors.length > 0) {
      console.error('\n─── Errors ───');
      for (const e of errors) console.error(e);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e?.stack ?? e?.message ?? e);
  process.exit(1);
});
