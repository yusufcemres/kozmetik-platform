/**
 * Faz N — AI search shortcut seed (30 intent).
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  const json = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'ai-search-shortcuts.json'), 'utf8')
  );

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  let count = 0;
  for (const s of json.shortcuts) {
    await client.query(
      `INSERT INTO ai_search_shortcuts (intent_key, keywords, title, description, caution, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (intent_key) DO UPDATE SET
         keywords = EXCLUDED.keywords,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         caution = EXCLUDED.caution,
         updated_at = NOW()`,
      [s.intent_key, s.keywords, s.title || null, s.description || null, s.caution || null]
    );
    count++;
  }
  console.log(`✓ ${count} ai_search_shortcuts upserted`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
