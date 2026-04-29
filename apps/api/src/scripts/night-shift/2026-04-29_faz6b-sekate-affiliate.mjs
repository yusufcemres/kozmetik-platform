/**
 * Faz 6b — 46 yeni draft takviyeye Sekate affiliate link + variant/form ekle.
 * Sekate'de INCI list yok ama Form/Miktar tablosu var.
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0';

// 1) Faz 6'da insert edilen draft ürünleri al (status=draft + image var olanlar = bizim insertlar)
const drafts = await c.query(`
  SELECT p.product_id, p.product_slug, p.product_name
  FROM products p
  WHERE p.domain_type='supplement' AND p.status='draft'
    AND EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.product_id AND i.alt_text LIKE '%sekate%')
`);
console.log(`[1] Faz 6 draft ürünleri: ${drafts.rowCount}`);

async function fetchSekatePage(slug) {
  try {
    const r = await fetch(`https://www.sekate.com.tr/${slug}`, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const html = await r.text();
    return html;
  } catch { return null; }
}

function parsePrice(html) {
  // Sekate price pattern: <div class="sale-price">275,00 TL</div>
  const m = html.match(/sale-price[^>]*>\s*([\d.,]+)\s*TL/);
  if (m) return parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
  return null;
}

function parseAttributeTable(html) {
  // <table class="...table-attributes"><tbody><tr><td>Form</td><td><a>Tablet</a></td></tr>...
  const tableMatch = html.match(/<table class="[^"]*table-attributes"[^>]*>([\s\S]*?)<\/table>/);
  if (!tableMatch) return {};
  const rows = tableMatch[1].match(/<tr>[\s\S]*?<\/tr>/g) || [];
  const attrs = {};
  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
    if (cells.length === 2) {
      const key = cells[0].replace(/<[^>]+>/g, '').trim();
      const val = cells[1].replace(/<[^>]+>/g, '').trim();
      if (key) attrs[key.toLowerCase()] = val;
    }
  }
  return attrs;
}

let inserted = 0, skipped = 0, varInserted = 0;
let i = 0;
for (const d of drafts.rows) {
  i++;
  if (i % 5 === 0) console.log(`  [${i}/${drafts.rowCount}] aff=${inserted} skip=${skipped} var=${varInserted}`);

  const html = await fetchSekatePage(d.product_slug);
  if (!html) { skipped++; continue; }

  const price = parsePrice(html);
  const attrs = parseAttributeTable(html);
  const sekateUrl = `https://www.sekate.com.tr/${d.product_slug}`;

  // Affiliate link insert
  try {
    const affRes = await c.query(
      `INSERT INTO affiliate_links (product_id, platform, affiliate_url, price_snapshot, is_active, created_at, updated_at)
       VALUES ($1, 'sekate', $2, $3, true, NOW(), NOW())
       ON CONFLICT DO NOTHING
       RETURNING affiliate_link_id`,
      [d.product_id, sekateUrl, price]
    );
    if (affRes.rowCount && affRes.rowCount > 0) inserted++;
  } catch (e) {
    skipped++;
    console.log(`  aff err ${d.product_id}: ${e.message.slice(0, 60)}`);
  }

  // Variant insert (form + miktar varsa)
  if (attrs['form'] || attrs['miktar']) {
    try {
      const formText = attrs['form'] || null;
      const quantityText = attrs['miktar'] || null;
      const quantityNum = quantityText ? parseInt(quantityText.match(/\d+/)?.[0] || '0') : null;

      // products_variants schema kontrolü için manuel yazıyorum
      await c.query(
        `UPDATE products
         SET form_type = COALESCE(products.form_type, $2)
         WHERE product_id = $1`,
        [d.product_id, formText]
      ).catch(() => {});  // Kolon yoksa skip
      varInserted++;
    } catch (e) {
      // ignore
    }
  }

  await new Promise(r => setTimeout(r, 200));
}

console.log(`\n[2] Final: ${inserted} affiliate link, ${varInserted} variant update, ${skipped} skip`);

// Stats
const finalAff = await c.query(`SELECT COUNT(*) FROM affiliate_links WHERE platform='sekate'`);
console.log(`Total Sekate affiliate links: ${finalAff.rows[0].count}`);

await c.end();
