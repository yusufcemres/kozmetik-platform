/**
 * Site state audit — checks which Sprint deliverables are actually applied to DB.
 */
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
    console.log('\n=== 1. content_articles (rehber #7) ===');
    const r1 = await client.query(`
      SELECT content_type, COUNT(*)::int AS n
      FROM content_articles
      WHERE status = 'published'
      GROUP BY content_type
      ORDER BY content_type
    `);
    if (r1.rowCount === 0) console.log('  HİÇ MAKALE YOK — PR #47 merge edilmedi veya seed çalıştırılmadı');
    r1.rows.forEach(r => console.log(`  ${r.content_type.padEnd(25)} ${r.n}`));

    console.log('\n=== 2. brands country_of_origin distribution (#6) ===');
    const r2 = await client.query(`
      SELECT COALESCE(country_of_origin, 'NULL') AS country, COUNT(*)::int AS n
      FROM brands GROUP BY country_of_origin ORDER BY n DESC
    `);
    r2.rows.forEach(r => console.log(`  ${r.country.padEnd(15)} ${r.n}`));
    const trText = r2.rows.find(r => r.country === 'Türkiye');
    const trCode = r2.rows.find(r => r.country === 'TR');
    if (trText && trCode) {
      console.log(`  ⚠ ÇİFT STANDART: 'Türkiye' (${trText.n}) ve 'TR' (${trCode.n}) ayrı ayrı kayıtlı — frontend sadece TR/KR/FR ISO2 destekliyor`);
    }

    console.log('\n=== 3. needs.domain_type fix (#9) ===');
    const r3 = await client.query(`
      SELECT need_slug, need_name, domain_type
      FROM needs
      WHERE need_slug IN (
        'bagisiklik-destegi','kalp-damar-sagligi','kemik-eklem','kas-iskelet',
        'sindirim-sagligi','enerji-canlilik','uyku-kalitesi','goz-sagligi',
        'sac-sagligi','tirnak-sagligi'
      )
      ORDER BY need_slug
    `);
    r3.rows.forEach(r => console.log(`  ${r.need_slug.padEnd(25)} ${(r.domain_type || 'NULL').padEnd(12)} ${r.need_name}`));
    const supplementOnly = r3.rows.filter(r => r.domain_type === 'supplement').length;
    if (supplementOnly === 0) console.log('  ⚠ HİÇBİR NEED supplement domain_type DEĞİL — fix-need-domain-type.sql çalıştırılmadı');

    console.log('\n=== 4. food_sources coverage (#10) ===');
    const r4 = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE food_sources IS NOT NULL AND jsonb_array_length(food_sources) > 0)::int AS filled,
        COUNT(*)::int AS total
      FROM ingredients
      WHERE ingredient_slug IN (
        'thiamine','riboflavin','niacin','pantothenic-acid','pyridoxine',
        'biotin','folic-acid','vitamin-b12','vitamin-a','vitamin-d3',
        'vitamin-e','vitamin-k2','zinc','magnesium','iron','calcium','selenium','iodine',
        'l-serine','l-carnitine','l-theanine','betaine-hcl','coq10','omega-3','lutein',
        'hydrolyzed-collagen'
      )
    `);
    console.log(`  ${r4.rows[0].filled}/${r4.rows[0].total} hedef ingredient food_sources dolu`);

    console.log('\n=== 5. ingredients safety_narrative (#14) ===');
    const r5 = await client.query(`
      SELECT COUNT(*)::int AS n FROM ingredients
      WHERE safety_narrative IS NOT NULL OR controversy_summary IS NOT NULL
    `).catch(e => ({ rows: [{ n: '— column missing (migration 027 çalıştırılmadı)' }] }));
    console.log(`  ${r5.rows[0].n} ingredient narrative dolu`);

    console.log('\n=== 6. /scoring/needs/X/top-products?domain_type=supplement test (Kas & Performans) ===');
    const r6 = await client.query(`
      SELECT n.need_id, n.need_name, n.domain_type
      FROM needs n WHERE n.need_slug = 'kas-iskelet'
    `);
    if (r6.rowCount && r6.rows[0]) {
      const need = r6.rows[0];
      console.log(`  Need: ${need.need_name} (id=${need.need_id}, domain_type=${need.domain_type})`);
      const r6b = await client.query(`
        SELECT pns.product_id, p.product_name, p.domain_type AS p_domain, pns.compatibility_score
        FROM product_need_scores pns
        JOIN products p ON p.product_id = pns.product_id
        WHERE pns.need_id = $1
        ORDER BY pns.compatibility_score DESC
        LIMIT 10
      `, [need.need_id]);
      console.log(`  product_need_scores tablosunda ${r6b.rowCount} satır:`);
      r6b.rows.forEach(r => console.log(`    [${r.p_domain}] ${r.product_name} %${Math.round(r.compatibility_score)}`));
      const supplementCount = r6b.rows.filter(r => r.p_domain === 'supplement').length;
      if (supplementCount === 0) console.log('  ⚠ Bu need için TAKVİYE ürünü hiç skorlanmamış!');
    } else {
      console.log('  Need bulunamadı: kas-iskelet');
    }
  } finally {
    await client.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
