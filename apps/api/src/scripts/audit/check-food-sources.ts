/**
 * Food-sources audit — ingredient.food_sources JSONB eksiği / thinness tespiti.
 *
 * Hata mantığı: Bir kullanıcı "X gıdasında Y ingredient'ı var, neden sitede
 * yok?" diyebiliyor (örnek: melatonin için kivi, pistachio eksikti). Bu
 * tool DB'yi tarar:
 *   1. food_sources NULL olan supplement ingredient'lar
 *   2. food_sources thin (<3 entry) olanlar
 *   3. food_sources entry'lerinde `food_name` veya `amount_per_100g` eksik olanlar
 *
 * Supplement domain'de takviye alırken gıda alternatifi kullanıcıya yol
 * gösterici; "doğru bilgilendirme" kritik. Bitki/hormon tipi ingredient'lar
 * food_sources'den muaf değil — melatonin gibi bilinen gıda kaynakları olan
 * hormonlar DA listelenmeli.
 *
 * Usage:
 *   ts-node check-food-sources.ts                  # tüm ingredient'lar
 *   ts-node check-food-sources.ts --thin=3         # <3 entry olanları flag'le
 *   ts-node check-food-sources.ts --high-demand    # sadece popüler ingredient'lar
 *   ts-node check-food-sources.ts --fail-on-issue  # issue varsa exit 2 (CI için)
 */
import { newClient } from '../onboarding/db';

type Issue = {
  ingredient_id: number;
  ingredient_slug: string;
  common_name: string | null;
  reason: string;
  current_sources: number;
};

async function main() {
  const thinThreshold = Number(process.argv.find(a => a.startsWith('--thin='))?.split('=')[1] || 3);
  const highDemandOnly = process.argv.includes('--high-demand');
  const failOnIssue = process.argv.includes('--fail-on-issue');

  const client = newClient();
  await client.connect();

  const highDemandSlugs = [
    'magnesium', 'vitamin-d3', 'vitamin-c', 'vitamin-b12', 'iron', 'zinc',
    'omega-3', 'calcium', 'melatonin', 'vitamin-k2', 'folate', 'iodine',
    'selenium', 'potassium', 'vitamin-a', 'vitamin-e', 'coq10', 'biotin',
    'niacin', 'choline',
  ];

  const filter = highDemandOnly
    ? `AND ingredient_slug = ANY($1::text[])`
    : `AND domain_type = 'supplement'`;
  const params: any[] = highDemandOnly ? [highDemandSlugs] : [];

  const sql = `
    SELECT ingredient_id, ingredient_slug, common_name, food_sources
    FROM ingredients
    WHERE is_active = TRUE ${filter}
    ORDER BY ingredient_slug
  `;
  const res = await client.query(sql, params);

  const issues: Issue[] = [];
  for (const row of res.rows) {
    const src = row.food_sources;
    if (src === null) {
      issues.push({
        ingredient_id: row.ingredient_id,
        ingredient_slug: row.ingredient_slug,
        common_name: row.common_name,
        reason: 'NULL — hiç gıda kaynağı yok',
        current_sources: 0,
      });
      continue;
    }
    if (!Array.isArray(src)) {
      issues.push({
        ingredient_id: row.ingredient_id,
        ingredient_slug: row.ingredient_slug,
        common_name: row.common_name,
        reason: 'INVALID — JSONB array değil',
        current_sources: 0,
      });
      continue;
    }
    if (src.length < thinThreshold) {
      issues.push({
        ingredient_id: row.ingredient_id,
        ingredient_slug: row.ingredient_slug,
        common_name: row.common_name,
        reason: `THIN — sadece ${src.length} kaynak (eşik: ${thinThreshold})`,
        current_sources: src.length,
      });
      continue;
    }
    const bad = src.find((e: any) => !e.food_name || e.amount_per_100g === undefined || e.amount_per_100g === null);
    if (bad) {
      issues.push({
        ingredient_id: row.ingredient_id,
        ingredient_slug: row.ingredient_slug,
        common_name: row.common_name,
        reason: `MALFORMED — entry eksik field (ör: "${JSON.stringify(bad).slice(0, 60)}")`,
        current_sources: src.length,
      });
    }
  }

  console.log(`🥗 Food-sources audit — ${res.rows.length} ingredient tarandı (${highDemandOnly ? 'high-demand only' : 'tüm supplement'})`);
  console.log(`   eşik: <${thinThreshold} entry = thin\n`);

  if (issues.length === 0) {
    console.log('✅ Tüm food_sources yeterli ve iyi yapılandırılmış.');
    await client.end();
    return;
  }

  console.log(`⚠️  ${issues.length} ingredient'ta sorun:\n`);
  console.log(`  ${'ID'.padEnd(6)} ${'Slug'.padEnd(28)} ${'Src#'.padEnd(5)} Sebep`);
  console.log(`  ${'-'.repeat(80)}`);
  for (const i of issues) {
    console.log(`  ${String(i.ingredient_id).padEnd(6)} ${i.ingredient_slug.padEnd(28)} ${String(i.current_sources).padEnd(5)} ${i.reason}`);
  }

  await client.end();
  if (failOnIssue) process.exit(2);
}

main().catch(e => {
  console.error('❌', e?.stack ?? e);
  process.exit(1);
});
