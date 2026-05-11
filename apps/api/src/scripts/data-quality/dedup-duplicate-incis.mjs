/**
 * Ayni INCI ismine sahip duplicate kayitlari birlestirir.
 * Master = en cok product_ingredient'da kullanilan kayit.
 * Digerlerinin product_ingredient + ingredient_need_mapping baglantilarini master'a tasir.
 * Sonra duplicate'i is_active=false yapar (soft delete — referential integrity icin).
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DRY = process.argv.includes('--dry');

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

await client.connect();
console.log(`=== Duplicate INCI Dedup (dry=${DRY}) ===\n`);

// Ayni name (case-insensitive, trimmed) ile birden fazla active kayit
const dups = await client.query(`
  SELECT LOWER(TRIM(REGEXP_REPLACE(inci_name, '\\s+', ' ', 'g'))) AS norm,
    array_agg(ingredient_id ORDER BY (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.ingredient_id=i.ingredient_id) DESC) AS ids,
    array_agg(inci_name) AS names
  FROM ingredients i
  WHERE is_active = true
  GROUP BY LOWER(TRIM(REGEXP_REPLACE(inci_name, '\\s+', ' ', 'g')))
  HAVING COUNT(*) > 1
`);

let totalGroups = 0;
let totalDeactivated = 0;
let totalPiMoved = 0;
let totalMappingMoved = 0;

for (const g of dups.rows) {
  totalGroups++;
  const [masterId, ...otherIds] = g.ids.map(Number);
  console.log(`\n[${totalGroups}] '${g.names[0]}' master=#${masterId} duplicates=[${otherIds.join(',')}]`);

  for (const oid of otherIds) {
    // 1. product_ingredients: oid kayitlarini master'a tasi (master'da olmayanlar)
    const moved = await client.query(
      `${DRY ? 'EXPLAIN ' : ''}UPDATE product_ingredients SET ingredient_id = $1
       WHERE ingredient_id = $2
         AND NOT EXISTS (SELECT 1 FROM product_ingredients pi2 WHERE pi2.product_id = product_ingredients.product_id AND pi2.ingredient_id = $1)
       RETURNING product_ingredient_id`,
      [masterId, oid],
    );
    const movedCount = DRY ? 0 : moved.rowCount || 0;
    totalPiMoved += movedCount;
    // Kalanlari (master ile cakisanlari) sil
    if (!DRY) {
      const deleted = await client.query(
        `DELETE FROM product_ingredients WHERE ingredient_id = $1 RETURNING product_ingredient_id`,
        [oid],
      );
      console.log(`    #${oid}: moved ${movedCount} PI to master, deleted ${deleted.rowCount} duplicate PI`);
    }

    // 2. ingredient_need_mappings: oid -> master (yoksa)
    if (!DRY) {
      const mappingMoved = await client.query(
        `UPDATE ingredient_need_mappings SET ingredient_id = $1
         WHERE ingredient_id = $2
           AND NOT EXISTS (SELECT 1 FROM ingredient_need_mappings m2 WHERE m2.ingredient_id = $1 AND m2.need_id = ingredient_need_mappings.need_id)
         RETURNING ingredient_need_mapping_id`,
        [masterId, oid],
      );
      await client.query(`DELETE FROM ingredient_need_mappings WHERE ingredient_id = $1`, [oid]);
      totalMappingMoved += mappingMoved.rowCount || 0;
    }

    // 3. Soft-delete duplicate INCI
    if (!DRY) {
      await client.query(`UPDATE ingredients SET is_active = false, updated_at = NOW() WHERE ingredient_id = $1`, [oid]);
      totalDeactivated++;
    }
  }
}

console.log(`\n=== Stats ===`);
console.log(`Duplicate groups: ${totalGroups}`);
console.log(`INCI deactivated: ${totalDeactivated}`);
console.log(`product_ingredients moved: ${totalPiMoved}`);
console.log(`ingredient_need_mappings moved: ${totalMappingMoved}`);
await client.end();
