/**
 * #12 FIX — Cross-domain need_score anomalileri:
 *   - Kozmetik ürün × supplement-only need (Kemik&Eklem, Bağışıklık, vb.)
 *   - Supplement ürün × cosmetic-only need (Anti-Oksidan, Bariyer, vb.)
 *
 * Kozmetik ürün sayfasında "Kemik & Eklem %65" gibi anlamsız skorlar görünüyor.
 * Need'in domain_type'ı 'both' değilse, ürünün domain_type'ıyla eşleşmiyor — sil.
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

async function main() {
  const apply = process.argv.includes('--apply');
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // Sayım
  const before = await c.query(`
    SELECT
      p.domain_type as product_domain,
      n.domain_type as need_domain,
      COUNT(*) as score_count
    FROM product_need_scores pns
    JOIN products p ON p.product_id = pns.product_id
    JOIN needs n ON n.need_id = pns.need_id
    WHERE n.domain_type != 'both' AND p.domain_type != n.domain_type
    GROUP BY p.domain_type, n.domain_type
    ORDER BY score_count DESC
  `);
  console.log('Cross-domain mismatch (silinecekler):');
  let total = 0;
  for (const row of before.rows) {
    console.log(`  ${row.product_domain} ürün × ${row.need_domain}-only need: ${row.score_count} skor`);
    total += parseInt(row.score_count);
  }
  console.log(`  TOPLAM: ${total} mismatch skor`);

  if (!apply) {
    console.log('\n--apply ekleyerek sil');
    await c.end();
    return;
  }

  await c.query('BEGIN');
  try {
    // 1. Mismatch skorları sil
    const del = await c.query(`
      DELETE FROM product_need_scores
      WHERE product_need_score_id IN (
        SELECT pns.product_need_score_id
        FROM product_need_scores pns
        JOIN products p ON p.product_id = pns.product_id
        JOIN needs n ON n.need_id = pns.need_id
        WHERE n.domain_type != 'both' AND p.domain_type != n.domain_type
      )
    `);
    console.log(`\nSilinen mismatch skorlar: ${del.rowCount}`);

    // 2. top_need refresh — eğer top_need silinmişse, en yüksek geri kalanı al
    const refresh = await c.query(`
      UPDATE products p SET top_need_name = sub.need_name, top_need_score = sub.compatibility_score
      FROM (
        SELECT DISTINCT ON (ns.product_id) ns.product_id, n.need_name, ns.compatibility_score
        FROM product_need_scores ns JOIN needs n ON n.need_id = ns.need_id
        ORDER BY ns.product_id, ns.compatibility_score DESC
      ) sub
      WHERE p.product_id = sub.product_id
        AND (p.top_need_name IS NULL OR p.top_need_name != sub.need_name)
    `);
    console.log(`Top_need güncellenen ürün: ${refresh.rowCount}`);

    await c.query('COMMIT');

    // Sonuç
    const after = await c.query(`
      SELECT
        p.domain_type as product_domain,
        n.domain_type as need_domain,
        COUNT(*) as score_count
      FROM product_need_scores pns
      JOIN products p ON p.product_id = pns.product_id
      JOIN needs n ON n.need_id = pns.need_id
      WHERE n.domain_type != 'both' AND p.domain_type != n.domain_type
      GROUP BY p.domain_type, n.domain_type
    `);
    console.log(`\nKalan mismatch: ${after.rows.length === 0 ? 'YOK ✓' : after.rows.length}`);
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('FAIL:', e.message);
    process.exit(2);
  } finally {
    await c.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
