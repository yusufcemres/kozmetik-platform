/** Quick check — which vitamin-*, b*, folate slugs actually exist? */
import { Client } from 'pg';

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const r = await client.query(
    `SELECT ingredient_slug, common_name, domain_type, evidence_grade,
            function_summary IS NOT NULL AS has_fn
     FROM ingredients
     WHERE ingredient_slug LIKE 'vitamin-%'
        OR ingredient_slug LIKE 'b-%'
        OR ingredient_slug IN ('folate','folic-acid','pyridoxine','pyridoxal-5-phosphate','cyanocobalamin','methylcobalamin','thiamine','riboflavin','niacin','pantothenic-acid','biotin','choline','inositol','cholecalciferol','ergocalciferol','retinol','retinyl-palmitate','phylloquinone','menaquinone-7','menaquinone-4','tocopherol','tocotrienol','ascorbic-acid','calcium','magnesium','zinc','iron','iodine','selenium','copper','manganese','chromium','potassium','phosphorus')
     ORDER BY ingredient_slug`,
  );
  console.log(JSON.stringify(r.rows, null, 2));
  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
