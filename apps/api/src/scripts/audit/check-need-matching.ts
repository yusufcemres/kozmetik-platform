/**
 * Need-matching audit.
 *
 * Each Need should have at least 3 matching products (via product_need_scores).
 * Flags under-matched needs so we know which ones require a recalculate-all run
 * or fresh ingredient_need_mappings. Reports separately for cosmetic and
 * supplement domains since the Need entity itself has a domain_type.
 *
 * Usage:
 *   ts-node check-need-matching.ts
 *   ts-node check-need-matching.ts --threshold=5
 *   ts-node check-need-matching.ts --fail-on-low   # exit 2 when any need < threshold
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';

async function main() {
  const args = process.argv.slice(2);
  const thresholdArg = args.find((a) => a.startsWith('--threshold='));
  const threshold = thresholdArg ? parseInt(thresholdArg.split('=')[1], 10) : 3;
  const failOnLow = args.includes('--fail-on-low');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const ds = app.get(DataSource);

  const rows: Array<{
    need_id: number;
    need_name: string;
    need_slug: string;
    domain_type: string;
    product_count: string;
  }> = await ds.query(`
    SELECT
      n.need_id,
      n.need_name,
      n.need_slug,
      COALESCE(n.domain_type, 'cosmetic') AS domain_type,
      COUNT(DISTINCT pns.product_id) AS product_count
    FROM needs n
    LEFT JOIN product_need_scores pns ON pns.need_id = n.need_id
    LEFT JOIN products p ON p.product_id = pns.product_id AND p.status = 'published'
    WHERE COALESCE(n.is_active, TRUE) = TRUE
    GROUP BY n.need_id, n.need_name, n.need_slug, n.domain_type
    ORDER BY product_count ASC, n.need_name ASC
  `);

  const stats = { total: rows.length, low: 0, zero: 0 };
  const lowNeeds: typeof rows = [];

  for (const r of rows) {
    const count = parseInt(r.product_count, 10);
    if (count === 0) stats.zero++;
    if (count < threshold) {
      stats.low++;
      lowNeeds.push(r);
    }
  }

  console.log('\n=== Need Matching Audit ===\n');
  console.log(`Threshold: < ${threshold} products`);
  console.log(`Total active needs: ${stats.total}`);
  console.log(`Needs below threshold: ${stats.low}`);
  console.log(`Needs with ZERO products: ${stats.zero}`);
  console.log('');

  if (lowNeeds.length > 0) {
    console.log('slug | name | domain | product_count');
    console.log('---- | ---- | ------ | --------------');
    for (const n of lowNeeds) {
      console.log(
        `${n.need_slug} | ${n.need_name} | ${n.domain_type} | ${n.product_count}`,
      );
    }
  } else {
    console.log('All active needs meet the threshold.');
  }

  await app.close();

  if (failOnLow && stats.low > 0) {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
