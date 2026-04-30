// CeraVe Acne Foaming Cream Wash + tüm ürünlerde orphan product_ingredients fix
// Yani ingredient_id IS NULL olan ama ingredient_display_name'den slug çıkartılabilen satırlar

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// 1. CeraVe ürününü bul
const product = await c.query(
  `SELECT product_id, product_name, product_slug FROM products WHERE product_slug = 'cerave-acne-foaming-cream-wash'`
);
console.log('## Ürün:', product.rows[0]);

// 2. Bu ürünün tüm INCI listesi
const inci = await c.query(
  `SELECT pi.product_ingredient_id, pi.ingredient_id, pi.ingredient_display_name, pi.inci_order_rank, i.ingredient_slug, i.function_summary
   FROM product_ingredients pi
   LEFT JOIN ingredients i ON i.ingredient_id = pi.ingredient_id
   WHERE pi.product_id = $1
   ORDER BY pi.inci_order_rank`,
  [product.rows[0].product_id]
);
console.log(`\n## ${inci.rows.length} INCI satırı:`);
for (const r of inci.rows) {
  console.log(`  ${String(r.inci_order_rank).padStart(2)} | id=${r.ingredient_id || 'NULL'} | "${r.ingredient_display_name}" → slug=${r.ingredient_slug || '-'} | summary=${r.function_summary ? '✓' : '✗'}`);
}

// 3. Tüm DB'deki orphan product_ingredients (ingredient_id NULL)
const orphans = await c.query(`
  SELECT DISTINCT pi.ingredient_display_name, COUNT(*) AS occurrences
  FROM product_ingredients pi
  WHERE pi.ingredient_id IS NULL
  GROUP BY pi.ingredient_display_name
  ORDER BY occurrences DESC
  LIMIT 50
`);
console.log(`\n## Orphan ingredient_display_name top 50:`);
for (const r of orphans.rows) {
  console.log(`  ${String(r.occurrences).padStart(4)} | "${r.ingredient_display_name}"`);
}

await c.end();
