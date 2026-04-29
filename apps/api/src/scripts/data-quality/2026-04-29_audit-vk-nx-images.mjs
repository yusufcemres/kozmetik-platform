import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

function tokenize(s) {
  return s.toLowerCase().replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ıİI]/g,'i').replace(/[öÖ]/g,'o').replace(/[şŞ]/g,'s').replace(/[üÜ]/g,'u').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(t=>t.length>=3 && !/^(60|90|30|120|tablet|kapsul|kapsule|gida|takviye|edici|vitamin|mineral|ml|mg|gr|adet)$/.test(t));
}
function jaccard(a, b) {
  const sA = new Set(a), sB = new Set(b); const i = [...sA].filter(x=>sB.has(x)).length; const u = new Set([...sA,...sB]).size; return u>0?i/u:0;
}

const r = await c.query(`SELECT i.image_id, i.product_id, i.image_url, i.alt_text, p.product_slug, p.product_name FROM product_images i JOIN products p ON p.product_id=i.product_id WHERE p.domain_type='supplement' AND (i.alt_text LIKE '%voonka%' OR i.alt_text LIKE '%nutraxin%')`);
console.log(`Voonka+Nutraxin image: ${r.rowCount}`);

const wrong = [];
for (const row of r.rows) {
  // Image URL'den dosya adı çıkar
  let fname = row.image_url.split('/').pop() || '';
  fname = fname.replace(/\.\w+$/, '').replace(/-\d+x\d+$/, '');
  const score = jaccard(tokenize(row.product_slug), tokenize(fname));
  if (score < 0.20) wrong.push({...row, fname, score});
}
console.log(`Yanlış şüphesi: ${wrong.length}`);
for (const w of wrong.slice(0, 25)) console.log(`  [${w.score.toFixed(2)}] DB="${w.product_slug.slice(0,45)}" ↔ FILE="${w.fname.slice(0,55)}"`);
await c.end();
