import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const apply = process.argv.includes('--apply');
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// frontend filtre listesi: guide | ingredient_explainer | need_guide | label_reading | comparison | news
// DB'de var olup frontend'in bilmediği content_type'lar:
// - ingredient_guide (2 makale) → ingredient_explainer'a normalize et

const before = await c.query(`SELECT article_id, slug, title, content_type FROM content_articles WHERE content_type = 'ingredient_guide'`);
console.log(`'ingredient_guide' content_type'lı ${before.rows.length} makale:`);
for (const r of before.rows) console.log(`  [${r.article_id}] ${r.slug} — ${r.title}`);

if (!apply) {
  console.log('\n--apply ekleyerek "ingredient_explainer"a çevir');
  await c.end();
  process.exit(0);
}

const r = await c.query(`UPDATE content_articles SET content_type = 'ingredient_explainer' WHERE content_type = 'ingredient_guide'`);
console.log(`\nGüncellenen: ${r.rowCount}`);
await c.end();
