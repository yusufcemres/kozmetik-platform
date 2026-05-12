/**
 * Auto-merge duplicate INCI'lar — ayni inci_name'e sahip kayitlarda
 * en uzun detailed_description'a sahip olan kazanir.
 * Loser: product_ingredients FK guncellenir, is_active=false, inci_name'e [DUP-{id}] eklenir.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

await client.connect();

const { rows: groups } = await client.query(`
  SELECT inci_name, array_agg(ingredient_id ORDER BY ingredient_id) AS ids,
    array_agg(LENGTH(COALESCE(detailed_description,'')) ORDER BY ingredient_id) AS desc_lens
  FROM ingredients GROUP BY inci_name HAVING COUNT(*) > 1
`);

console.log(`=== Merge ${groups.length} duplicate INCI groups ===\n`);

let merged = 0, links_moved = 0;
for (const g of groups) {
  // Kazanan = en uzun description; tie ise daha küçük ID
  let winnerIdx = 0;
  for (let i = 1; i < g.ids.length; i++) {
    if (g.desc_lens[i] > g.desc_lens[winnerIdx]) winnerIdx = i;
  }
  const winnerId = g.ids[winnerIdx];
  const losers = g.ids.filter((_, i) => i !== winnerIdx);

  await client.query('BEGIN');
  try {
    for (const loserId of losers) {
      // product_ingredients FK guncelle (eger kazanan-loser ayni urunde yoksa)
      const linkUpd = await client.query(`
        UPDATE product_ingredients SET ingredient_id = $1
        WHERE ingredient_id = $2 AND product_id NOT IN (
          SELECT product_id FROM product_ingredients WHERE ingredient_id = $1
        )
      `, [winnerId, loserId]);
      // Cakisanlari sil (loser tarafini)
      const linkDel = await client.query(`DELETE FROM product_ingredients WHERE ingredient_id = $1`, [loserId]);
      links_moved += linkUpd.rowCount + linkDel.rowCount;

      // ingredient_need_mappings da kazanana yonlendir
      await client.query(`
        DELETE FROM ingredient_need_mappings WHERE ingredient_id = $1
        AND (ingredient_id, need_id) IN (
          SELECT ingredient_id, need_id FROM ingredient_need_mappings WHERE ingredient_id = $2
        )
      `, [loserId, winnerId]).catch(() => {});
      await client.query(`UPDATE ingredient_need_mappings SET ingredient_id = $1 WHERE ingredient_id = $2`, [winnerId, loserId]).catch(() => {});

      // Loser deaktive et + isim degistir (unique constraint icin)
      await client.query(`
        UPDATE ingredients
        SET is_active = false,
            inci_name = inci_name || ' [DUP-' || ingredient_id || ']',
            ingredient_slug = ingredient_slug || '-dup-' || ingredient_id,
            updated_at = NOW()
        WHERE ingredient_id = $1
      `, [loserId]);

      merged++;
      console.log(`  merged ${g.inci_name}: ${loserId} -> ${winnerId}`);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(`  FAIL ${g.inci_name}:`, e.message);
  }
}

console.log(`\n=== Done: ${merged} losers merged, ${links_moved} product-ingredient links moved ===`);
await client.end();
