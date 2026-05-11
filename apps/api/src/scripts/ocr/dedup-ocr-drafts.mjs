/**
 * OCR ile eklenen draft urunlerde mukerrer kayitlari birlestirir.
 * Strateji:
 *   1. Brand + Product Name fuzzy match (same brand, similar name)
 *   2. INCI fingerprint hash (sorted unique INCI list -> SHA256)
 *   3. Master = en cok INCI'ye sahip kayit; digerleri INCI'yi ona aktar + delete
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const args = process.argv.slice(2);
const DRY = args.includes('--dry');

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

function normalize(s) {
  return (s || '').toLowerCase().trim().replace(/[^a-z0-9ığşçöü]/g, '');
}

function inciFingerprint(ingredientIds) {
  if (!ingredientIds || ingredientIds.length === 0) return null;
  const sorted = [...new Set(ingredientIds)].sort((a, b) => a - b);
  return createHash('sha256').update(sorted.join('|')).digest('hex').slice(0, 16);
}

await client.connect();
console.log(`=== OCR Draft Deduplication (dry=${DRY}) ===\n`);

// Son 1 saat icinde olusturulmus draft urunler
const drafts = await client.query(`
  SELECT p.product_id, p.product_name, p.barcode, p.brand_id, b.brand_name,
    ARRAY(SELECT pi.ingredient_id FROM product_ingredients pi WHERE pi.product_id = p.product_id AND pi.ingredient_id IS NOT NULL ORDER BY pi.ingredient_id) AS ing_ids
  FROM products p
  LEFT JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.status = 'draft' AND p.created_at > NOW() - INTERVAL '1 hour'
`);

console.log(`Recent drafts: ${drafts.rows.length}\n`);

// Group by (brand_name normalized + product_name normalized) OR same INCI fingerprint
const groups = new Map();
for (const d of drafts.rows) {
  const fp = inciFingerprint(d.ing_ids);
  const nameKey = `${normalize(d.brand_name)}|${normalize(d.product_name).slice(0, 30)}`;
  const fpKey = fp ? `fp:${fp}` : null;
  // Once isim-marka eslesmesi (yakin urunler), sonra fingerprint
  let groupKey = nameKey;
  // INCI fingerprint guclu sinyal — uzeri yazsin
  if (fpKey) {
    const existing = [...groups.keys()].find((k) => groups.get(k).fpKey === fpKey);
    if (existing) groupKey = existing;
  }
  if (!groups.has(groupKey)) groups.set(groupKey, { items: [], fpKey });
  groups.get(groupKey).items.push(d);
  if (fpKey && !groups.get(groupKey).fpKey) groups.get(groupKey).fpKey = fpKey;
}

// Mukerrer (>1) gruplari isle
const duplicateGroups = [...groups.values()].filter((g) => g.items.length > 1);
console.log(`Duplicate groups found: ${duplicateGroups.length}\n`);

let merged = 0;
let deleted = 0;
let inciMoved = 0;

for (const g of duplicateGroups) {
  // Master = en cok INCI'ye sahip
  g.items.sort((a, b) => (b.ing_ids?.length || 0) - (a.ing_ids?.length || 0));
  const master = g.items[0];
  const others = g.items.slice(1);
  console.log(`\nGroup [${master.brand_name}/${master.product_name?.slice(0, 40)}]`);
  console.log(`  Master: #${master.product_id} (${master.ing_ids?.length || 0} INCI)`);

  for (const o of others) {
    console.log(`  Merge:  #${o.product_id} -> #${master.product_id} (${o.ing_ids?.length || 0} INCI)`);
    if (!DRY) {
      // Master'da olmayan INCI'leri ekle
      if (o.ing_ids?.length) {
        await client.query(
          `INSERT INTO product_ingredients (
            product_id, ingredient_id, ingredient_display_name, inci_order_rank,
            concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims,
            match_status, created_at, updated_at
          )
          SELECT $1, pi.ingredient_id, pi.ingredient_display_name,
            pi.inci_order_rank + (SELECT COALESCE(MAX(inci_order_rank), 0) FROM product_ingredients WHERE product_id = $1),
            'unknown', false, false, 'matched', NOW(), NOW()
          FROM product_ingredients pi
          WHERE pi.product_id = $2
            AND pi.ingredient_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM product_ingredients pi2 WHERE pi2.product_id = $1 AND pi2.ingredient_id = pi.ingredient_id)`,
          [master.product_id, o.product_id]
        );
        inciMoved++;
      }
      // Master'da eksik barcode varsa o'dan al
      if (o.barcode && !master.barcode) {
        await client.query(
          `UPDATE products SET barcode = $1 WHERE product_id = $2 AND barcode IS NULL`,
          [o.barcode, master.product_id]
        );
        master.barcode = o.barcode;
      }
      // Sil
      await client.query(`DELETE FROM product_ingredients WHERE product_id = $1`, [o.product_id]);
      await client.query(`DELETE FROM products WHERE product_id = $1`, [o.product_id]);
      deleted++;
    }
  }
  merged++;
}

console.log(`\n=== Stats ===`);
console.log(`Groups merged: ${merged}`);
console.log(`Products deleted: ${deleted}`);
console.log(`INCI transfers: ${inciMoved}`);

await client.end();
