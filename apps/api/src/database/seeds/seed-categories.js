/**
 * Faz B — Kategori taksonomisi seed.
 * categories-taxonomy.json → categories (2 seviye, parent_category_id)
 * Mevcut ürünler etkilenmez, yeni kategoriler idempotent eklenir.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  const json = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'categories-taxonomy.json'), 'utf8')
  );

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  let parentCount = 0;
  let childCount = 0;

  for (const [idx, parent] of json.tree.entries()) {
    const res = await client.query(
      `INSERT INTO categories (category_name, category_slug, domain_type, sort_order, parent_category_id)
       VALUES ($1, $2, $3, $4, NULL)
       ON CONFLICT (category_slug) DO UPDATE SET
         category_name = EXCLUDED.category_name,
         domain_type = EXCLUDED.domain_type,
         sort_order = EXCLUDED.sort_order
       RETURNING category_id`,
      [parent.name, parent.slug, parent.domain, idx]
    );
    const parentId = res.rows[0].category_id;
    parentCount++;

    for (const [cidx, child] of parent.children.entries()) {
      await client.query(
        `INSERT INTO categories (category_name, category_slug, domain_type, sort_order, parent_category_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (category_slug) DO UPDATE SET
           category_name = EXCLUDED.category_name,
           parent_category_id = EXCLUDED.parent_category_id,
           sort_order = EXCLUDED.sort_order`,
        [child.name, child.slug, parent.domain, cidx, parentId]
      );
      childCount++;
    }
  }

  console.log(`✓ ${parentCount} parent + ${childCount} child categories upserted`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
