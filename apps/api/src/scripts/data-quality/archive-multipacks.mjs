/**
 * Multi-pack / lot ürünleri arşivle.
 * REVELA ürün analiz platformu — aynı formülün 6'lı 2'li paketi gereksiz.
 * Hedef: "Lot de 6", "Lot 2x200ml", "2x200ml", "6x100ml", coffret gibi promosyon paketleri.
 * KORUNUR: "Duo", "X3", "3x Effect", "Trio", "2x Barrier" gibi ürün serisi isimleri.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DRY_RUN = process.argv.includes('--dry-run');
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Dry-run: hangi ürünler etkilenecek
const { rows: targets } = await client.query(`
  SELECT product_id, product_name, status
  FROM products
  WHERE domain_type = 'cosmetic'
    AND status IN ('published', 'draft')
    AND (
      -- "Lot de N" — açık lot paketi
      product_name ILIKE '%lot de %'
      -- "Lot Nx..." — "Lot 2x200ml", "Lot 6x..."
      OR product_name ~* 'lot[\\s]+[0-9]+[\\s]*x'
      -- "NxVolume" — "2x200ml", "6x100ml", "2x100 ML" (sayı + x + sayı + ml/l)
      -- POSIX ERE: no \s or \b, use space literal
      OR product_name ~* '[0-9]+ *x *[0-9]+(ml|l)'
      -- "Rfw" prefix — "Rexona For Women" abbreviated multi-pack listings
      OR product_name ILIKE 'Rfw %'
      -- coffret = noel hediye seti, promosyon paketi
      OR product_name ILIKE '%coffret%'
    )
  ORDER BY product_name
`);

console.log(`\nTargets (${targets.length}):`);
targets.forEach(r => console.log(`  [${r.status}] #${r.product_id} ${r.product_name}`));

if (DRY_RUN) {
  console.log('\n[DRY RUN] No changes made.');
  await client.end();
  process.exit(0);
}

if (targets.length === 0) {
  console.log('\nNo targets found.');
  await client.end();
  process.exit(0);
}

const ids = targets.map(r => r.product_id);
const { rowCount } = await client.query(
  `UPDATE products SET status = 'archived', updated_at = NOW() WHERE product_id = ANY($1::int[])`,
  [ids]
);

console.log(`\n✓ Archived ${rowCount} multi-pack products.`);

// Final stats
const { rows: stats } = await client.query(`
  SELECT status, COUNT(*) as cnt FROM products WHERE domain_type='cosmetic' GROUP BY status ORDER BY cnt DESC
`);
console.log('\nCurrent DB state:');
stats.forEach(r => console.log(`  ${r.status}: ${r.cnt}`));

await client.end();
