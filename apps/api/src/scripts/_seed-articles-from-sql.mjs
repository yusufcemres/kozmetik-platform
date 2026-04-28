// rehber-articles-seed.sql dosyasından INSERT'i parse edip pg parameterized query ile seed et.
// Bu sayede apostrof/backslash escape problemi yok.
import { readFileSync } from 'fs';
import { Client } from 'pg';
import { config } from 'dotenv';
config();

const sql = readFileSync('apps/api/src/database/seeds/rehber-articles-seed.sql', 'utf8');

// E-string body parser: E'...' içeriğini Python-style string escape ile çözer
function parseEString(s, startIdx) {
  // s[startIdx] === "'" olacak (E'nin sonrasındaki ')
  let i = startIdx + 1;
  let out = '';
  while (i < s.length) {
    const c = s[i];
    if (c === '\\') {
      const next = s[i + 1];
      if (next === 'n') { out += '\n'; i += 2; continue; }
      if (next === 't') { out += '\t'; i += 2; continue; }
      if (next === 'r') { out += '\r'; i += 2; continue; }
      if (next === "'") { out += "'"; i += 2; continue; }
      if (next === '\\') { out += '\\'; i += 2; continue; }
      if (next === '"') { out += '"'; i += 2; continue; }
      // bilinmeyen escape
      out += next; i += 2; continue;
    }
    if (c === "'") {
      if (s[i + 1] === "'") { out += "'"; i += 2; continue; }
      return { value: out, endIdx: i + 1 };
    }
    out += c;
    i++;
  }
  throw new Error('Unterminated E-string at ' + startIdx);
}

// Regular string parser: '...' ('' = escape)
function parseString(s, startIdx) {
  let i = startIdx + 1;
  let out = '';
  while (i < s.length) {
    const c = s[i];
    if (c === "'") {
      if (s[i + 1] === "'") { out += "'"; i += 2; continue; }
      return { value: out, endIdx: i + 1 };
    }
    out += c;
    i++;
  }
  throw new Error('Unterminated string at ' + startIdx);
}

// Her VALUES satırını parse et — 7 field: title, slug, content_type, summary, body, status, published
const records = [];
const valuesStart = sql.indexOf('VALUES');
if (valuesStart < 0) throw new Error('No VALUES found');

let i = valuesStart + 'VALUES'.length;

while (i < sql.length) {
  // ( ara
  while (i < sql.length && sql[i] !== '(') i++;
  if (i >= sql.length) break;
  // Eğer yorumla çevriliyse geç
  // Basit: parentheses dengeli
  i++; // ( sonrası
  const fields = [];
  while (fields.length < 7 && i < sql.length) {
    // whitespace + virgül atla
    while (i < sql.length && /[\s,]/.test(sql[i])) i++;
    if (sql[i] === ')') break;
    if (sql[i] === 'E' && sql[i + 1] === "'") {
      const r = parseEString(sql, i + 1);
      fields.push(r.value);
      i = r.endIdx;
    } else if (sql[i] === "'") {
      const r = parseString(sql, i);
      fields.push(r.value);
      i = r.endIdx;
    } else if (sql.slice(i, i + 3) === 'NOW') {
      fields.push(new Date());
      while (sql[i] !== ')' && sql[i] !== ',') i++;
      // ')' yerinde kapanışsa kapat, yoksa devam
    } else {
      // Beklenmedik karakter
      i++;
    }
  }
  if (fields.length === 7) records.push(fields);
  // ')' sonrasını geç
  while (i < sql.length && sql[i] !== ')') i++;
  i++;
  // Eğer ON CONFLICT geliyorsa bitir
  if (sql.slice(i).trim().startsWith('ON CONFLICT')) break;
}

console.log(`Parsed ${records.length} article records`);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

let inserted = 0;
let skipped = 0;
for (const [title, slug, content_type, summary, body_markdown, status, published_at] of records) {
  try {
    const res = await client.query(
      `INSERT INTO content_articles (title, slug, content_type, summary, body_markdown, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (slug) DO NOTHING
       RETURNING article_id`,
      [title, slug, content_type, summary, body_markdown, status, published_at instanceof Date ? published_at : new Date()],
    );
    if (res.rowCount && res.rowCount > 0) inserted++;
    else skipped++;
  } catch (err) {
    console.error(`Failed [${slug}]:`, err.message);
  }
}

console.log(`Inserted: ${inserted} | Skipped (already exists): ${skipped}`);

const distribution = await client.query(
  `SELECT content_type, COUNT(*)::int AS n FROM content_articles WHERE status='published' GROUP BY content_type ORDER BY content_type`,
);
console.log('\nDistribution by content_type:');
for (const row of distribution.rows) console.log(`  ${row.content_type.padEnd(24)} ${row.n}`);

await client.end();
