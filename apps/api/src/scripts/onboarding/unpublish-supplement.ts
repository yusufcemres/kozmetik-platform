/**
 * Rollback / unpublish tool.
 *
 * Usage:
 *   ts-node unpublish-supplement.ts <product_id>           # → status='draft'
 *   ts-node unpublish-supplement.ts <product_id> --delete  # cascade delete
 *
 * Cascade delete order (reverse of Stage 3 insert):
 *   supplement_ingredients → product_ingredients → supplement_details →
 *   affiliate_links → product_images → product_scores → products
 *
 * Always wrapped in a transaction. Skips ingredient rows (they may be shared).
 */
import { newClient } from './db';

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const idArg = argv.find((a) => !a.startsWith('--'));
  const doDelete = argv.includes('--delete');
  if (!idArg) {
    console.error('Kullanım: unpublish-supplement.ts <product_id> [--delete]');
    process.exit(1);
  }
  const productId = parseInt(idArg, 10);
  if (Number.isNaN(productId)) {
    console.error('product_id integer olmalı.');
    process.exit(1);
  }

  const client = newClient();
  await client.connect();

  try {
    const check = await client.query(`SELECT product_id, product_name, status FROM products WHERE product_id=$1`, [productId]);
    if (check.rowCount === 0) {
      console.error(`Product ${productId} bulunamadı.`);
      process.exit(1);
    }
    const p = check.rows[0];
    console.log(`Hedef: [${p.product_id}] ${p.product_name} (status=${p.status})`);

    if (!doDelete) {
      await client.query(`UPDATE products SET status='draft', updated_at=now() WHERE product_id=$1`, [productId]);
      console.log(`✅ status='draft' yapıldı. Public sayfa artık 404 dönecek (revalidate sonrası).`);
      return;
    }

    await client.query('BEGIN');
    try {
      await client.query(`DELETE FROM supplement_ingredients WHERE product_id=$1`, [productId]);
      await client.query(`DELETE FROM product_ingredients WHERE product_id=$1`, [productId]);
      await client.query(`DELETE FROM supplement_details WHERE product_id=$1`, [productId]);
      await client.query(`DELETE FROM affiliate_links WHERE product_id=$1`, [productId]);
      await client.query(`DELETE FROM product_images WHERE product_id=$1`, [productId]);
      await client.query(`DELETE FROM product_scores WHERE product_id=$1`, [productId]);
      await client.query(`DELETE FROM product_need_scores WHERE product_id=$1`, [productId]);
      const del = await client.query(`DELETE FROM products WHERE product_id=$1`, [productId]);
      await client.query('COMMIT');
      console.log(`✅ Cascade delete OK. Etkilenen product satırı: ${del.rowCount}`);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e?.stack ?? e?.message ?? e);
  process.exit(1);
});
