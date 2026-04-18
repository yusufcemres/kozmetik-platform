const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech',
    port: 5432,
    user: 'neondb_owner',
    password: 'npg_0KZrPGQxqH5d',
    database: 'neondb',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const migs = await client.query('SELECT name FROM migrations ORDER BY id');
    console.log('--- migrations rowcount:', migs.rowCount);
    migs.rows.forEach((r) => console.log('  ', r.name));

    const ac = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'affiliate_clicks' ORDER BY ordinal_position`);
    console.log('\n--- affiliate_clicks columns:');
    ac.rows.forEach((r) => console.log(`   ${r.column_name}: ${r.data_type}`));

    const ph = await client.query(`
      SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='product_price_history') AS exists`);
    console.log('\n--- product_price_history exists:', ph.rows[0].exists);

    const ing = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='ingredients' AND column_name IN
      ('evidence_grade','evidence_citations','ul_dose','cir_status','cmr_class','eu_banned','bioavailability_score')`);
    console.log('\n--- ingredients evidence columns:', ing.rows.map((r) => r.column_name).join(', '));

    const ps = await client.query(`
      SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='product_scores') AS exists`);
    console.log('--- product_scores exists:', ps.rows[0].exists);

    const pi = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='product_ingredients' AND column_name='concentration_percent'`);
    console.log('--- product_ingredients.concentration_percent exists:', pi.rowCount > 0);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
