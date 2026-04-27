import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: resolve(__dirname, '../../../../../.env') });

async function main() {
  const url = process.env.DATABASE_URL!;
  const client = new Client({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    console.log('\n=== Articles by status × content_type ===');
    const r1 = await client.query(`
      SELECT content_type, status, COUNT(*)::int AS n,
        COUNT(*) FILTER (WHERE published_at IS NOT NULL)::int AS with_pub_date
      FROM content_articles
      GROUP BY content_type, status
      ORDER BY content_type, status
    `);
    r1.rows.forEach(r => console.log(`  ${r.content_type.padEnd(25)} ${r.status.padEnd(15)} n=${r.n} pub_date=${r.with_pub_date}`));

    console.log('\n=== Needs with "kas" or "performans" in name/slug ===');
    const r2 = await client.query(`
      SELECT need_id, need_slug, need_name, domain_type
      FROM needs
      WHERE need_slug ILIKE '%kas%' OR need_name ILIKE '%kas%' OR need_name ILIKE '%performans%'
    `);
    r2.rows.forEach(r => console.log(`  id=${r.need_id} ${r.need_slug.padEnd(20)} ${(r.domain_type||'NULL').padEnd(12)} ${r.need_name}`));

    if (r2.rowCount && r2.rows[0]) {
      const id = r2.rows[0].need_id;
      console.log(`\n=== product_need_scores for need_id=${id} ===`);
      const r3 = await client.query(`
        SELECT pns.product_id, p.product_name, p.domain_type, pns.compatibility_score
        FROM product_need_scores pns
        JOIN products p ON p.product_id = pns.product_id
        WHERE pns.need_id = $1 AND p.status IN ('published','active')
        ORDER BY pns.compatibility_score DESC
        LIMIT 15
      `, [id]);
      console.log(`  Total scored: ${r3.rowCount}`);
      r3.rows.forEach(r => console.log(`    [${r.domain_type}] ${r.product_name.substring(0, 50)} %${Math.round(r.compatibility_score)}`));
    }

    console.log('\n=== ALL needs.domain_type=supplement and product_need_scores coverage ===');
    const r4 = await client.query(`
      SELECT n.need_slug, n.need_name,
        COUNT(DISTINCT pns.product_id) FILTER (WHERE p.domain_type = 'supplement')::int AS supp_count,
        COUNT(DISTINCT pns.product_id) FILTER (WHERE p.domain_type = 'cosmetic')::int AS cos_count
      FROM needs n
      LEFT JOIN product_need_scores pns ON pns.need_id = n.need_id
      LEFT JOIN products p ON p.product_id = pns.product_id AND p.status IN ('published','active')
      WHERE n.domain_type = 'supplement'
      GROUP BY n.need_slug, n.need_name
      ORDER BY supp_count DESC NULLS LAST
    `);
    r4.rows.forEach(r => console.log(`  ${r.need_slug.padEnd(25)} supp=${r.supp_count} cos=${r.cos_count}  (${r.need_name})`));

  } finally {
    await client.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });
