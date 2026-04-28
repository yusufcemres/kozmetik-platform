import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

console.log('═══ REHBER + PROFILE AUDIT ═══\n');

// 1. content_articles içerik
console.log('## #7 — content_articles');
const r1cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='content_articles' ORDER BY ordinal_position`);
console.log(`  Kolonlar: ${r1cols.rows.map(r=>r.column_name).join(', ')}`);
const r1 = await c.query(`SELECT COUNT(*) FROM content_articles`);
console.log(`  Toplam: ${r1.rows[0].count}`);
if (parseInt(r1.rows[0].count) > 0) {
  const r1b = await c.query(`SELECT * FROM content_articles LIMIT 3`);
  console.log(`  Örnek satır:`, r1b.rows[0]);
}

// 1b. blog_posts
console.log('\n## blog_posts');
const r2cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='blog_posts' ORDER BY ordinal_position`);
console.log(`  Kolonlar: ${r2cols.rows.map(r=>r.column_name).join(', ')}`);
const r2 = await c.query(`SELECT COUNT(*) FROM blog_posts`);
console.log(`  Toplam: ${r2.rows[0].count}`);
if (parseInt(r2.rows[0].count) > 0) {
  const r2b = await c.query(`SELECT slug, title, content_type, status FROM blog_posts LIMIT 5`);
  for (const row of r2b.rows) console.log(`    [${row.content_type}/${row.status}] ${row.slug} — ${row.title}`);
}

// 1c. content_type breakdown
console.log('\n## blog_posts content_type breakdown');
const r3 = await c.query(`SELECT content_type, status, COUNT(*) FROM blog_posts GROUP BY content_type, status ORDER BY content_type`);
for (const row of r3.rows) console.log(`  ${row.content_type} (${row.status}): ${row.count}`);

// 2. user_skin_profiles kolonlar
console.log('\n## #3 — user_skin_profiles kolonlar');
const r4 = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='user_skin_profiles' ORDER BY ordinal_position`);
for (const row of r4.rows) console.log(`  ${row.column_name}: ${row.data_type}`);

// 2b. data var mı
const r4b = await c.query(`SELECT COUNT(*) FROM user_skin_profiles`);
console.log(`  Toplam kayıt: ${r4b.rows[0].count}`);

// 3. user_profiles
console.log('\n## user_profiles kolonlar');
const r5 = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='user_profiles' ORDER BY ordinal_position`);
for (const row of r5.rows) console.log(`  ${row.column_name}: ${row.data_type}`);
const r5b = await c.query(`SELECT COUNT(*) FROM user_profiles`);
console.log(`  Toplam: ${r5b.rows[0].count}`);

await c.end();
