/**
 * Archived INCI=0 ürünler için Tavily Search ile INCI listesi bul.
 * Arama: "{brand} {product} inci ingredients list cosing"
 * Sonuçtan INCI pattern'ı çıkar, product_ingredients'a ekle.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const TAVILY_KEY = process.env.TAVILY_API_KEY;
if (!TAVILY_KEY) { console.error('TAVILY_API_KEY required'); process.exit(1); }

const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '100');
const BRAND_FILTER = process.argv.find(a => a.startsWith('--brand='))?.split('=').slice(1).join('=');
const MIN_INCI = 3;

const client = new Client({ connectionString: process.env.DATABASE_URL });
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
function normalizeInci(s) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[*†‡§¶·•]/g, '').trim();
}

// Extract INCI list from arbitrary text
function extractInciFromText(text) {
  if (!text) return [];
  // Look for INCI-like patterns: sequences of scientific ingredient names
  // INCI names often: capitalized, latin, comma-separated, with parentheses
  const candidates = [];

  // Strategy 1: find lines/sections that look like ingredient lists
  const lines = text.split(/\n|;|\|/);
  for (const line of lines) {
    const words = line.split(',').map(s => s.trim()).filter(s => s.length >= 2 && s.length <= 100);
    if (words.length >= 4) {
      // Check if words look like INCI (mostly letters, possibly numbers/parentheses)
      const inciLike = words.filter(w => /^[a-zA-Z0-9\s\-()/%]+$/.test(w) && !/^\d+$/.test(w));
      if (inciLike.length >= Math.min(4, words.length * 0.7)) {
        candidates.push(...inciLike.map(normalizeInci));
      }
    }
  }

  // Strategy 2: Find "Ingredients:" section in raw text
  const m = text.match(/(?:Ingredients|INCI|İçerik|Composition)\s*:\s*([^.]{30,500})/i);
  if (m) {
    const parts = m[1].split(',').map(s => normalizeInci(s)).filter(s => s.length >= 2 && s.length <= 80);
    if (parts.length >= 3) candidates.push(...parts);
  }

  // Deduplicate and filter
  const unique = [...new Set(candidates)].filter(s =>
    s.length >= 2 && s.length <= 80 &&
    !/^\d+[\s%]*$/.test(s) &&
    !/^(and|or|with|for|the|de|en|le|la|les|du|des)$/i.test(s)
  );
  return unique;
}

async function tavilySearchInci(brand, productName) {
  const q = `"${brand}" "${productName.substring(0, 40)}" ingredients INCI list`;
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TAVILY_KEY}` },
      body: JSON.stringify({
        query: q,
        max_results: 5,
        search_depth: 'basic',
        include_raw_content: false,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();

    const allInci = [];
    for (const result of (data.results || [])) {
      const text = (result.content || '') + ' ' + (result.title || '');
      const found = extractInciFromText(text);
      if (found.length >= MIN_INCI) allInci.push(...found);
    }
    return [...new Set(allInci)];
  } catch { return []; }
}

await client.connect();

// Load INCI lookup
const { rows: allInci } = await client.query(`
  SELECT ingredient_id, inci_name, ingredient_slug FROM ingredients WHERE domain_type='cosmetic' AND is_active=true
`);
const inciBySlug = new Map(allInci.map(r => [r.ingredient_slug, r.ingredient_id]));
const inciByName = new Map(allInci.map(r => [normalizeInci(r.inci_name), r.ingredient_id]));
console.log(`Loaded ${allInci.length} INCI from DB\n`);

let brandClause = '';
const params = [LIMIT];
if (BRAND_FILTER) {
  params.push(`%${BRAND_FILTER}%`);
  brandClause = `AND b.brand_name ILIKE $${params.length}`;
}

const { rows: targets } = await client.query(`
  SELECT p.product_id, p.product_name, b.brand_name
  FROM products p JOIN brands b ON b.brand_id=p.brand_id
  WHERE p.status='archived' AND p.domain_type='cosmetic'
    AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id=p.product_id)
    ${brandClause}
  ORDER BY b.brand_name, p.product_id
  LIMIT $1
`, params);

console.log(`Targets: ${targets.length}${BRAND_FILTER ? ' (brand: ' + BRAND_FILTER + ')' : ''}\n`);

let found = 0, restored = 0, no_match = 0, new_ing = 0;

for (let i = 0; i < targets.length; i++) {
  const p = targets[i];
  try {
    const inciList = await tavilySearchInci(p.brand_name || '', p.product_name);
    if (inciList.length < MIN_INCI) { no_match++; await sleep(400); continue; }

    let inserted = 0;
    for (let rank = 0; rank < inciList.length; rank++) {
      const inciName = inciList[rank];
      const slug = slugify(inciName);
      let ingredientId = inciByName.get(inciName) || inciBySlug.get(slug);

      if (!ingredientId) {
        const displayName = inciName.charAt(0).toUpperCase() + inciName.slice(1);
        try {
          const { rows: newIng } = await client.query(`
            INSERT INTO ingredients (domain_type, inci_name, common_name, ingredient_slug,
              allergen_flag, fragrance_flag, preservative_flag, is_active, enrichment_source, created_at, updated_at)
            VALUES ('cosmetic', $1, $2, $3, false, false, false, true, 'tavily_search', NOW(), NOW())
            ON CONFLICT (ingredient_slug) DO UPDATE SET updated_at=NOW()
            RETURNING ingredient_id
          `, [displayName, displayName, slug + '-tv']);
          ingredientId = newIng[0]?.ingredient_id;
          if (ingredientId) { inciBySlug.set(slug + '-tv', ingredientId); inciByName.set(inciName, ingredientId); new_ing++; }
        } catch { continue; }
      }
      if (!ingredientId) continue;
      try {
        await client.query(`
          INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, listed_as_raw, match_status, match_confidence, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, 'matched', 75, NOW(), NOW())
          ON CONFLICT DO NOTHING
        `, [p.product_id, ingredientId, inciList[rank], rank + 1, inciList[rank]]);
        inserted++;
      } catch {}
    }

    if (inserted >= MIN_INCI) {
      await client.query(`UPDATE products SET status='draft', updated_at=NOW() WHERE product_id=$1`, [p.product_id]);
      restored++;
      console.log(`✓ #${p.product_id} ${p.product_name?.substring(0,35)} [${p.brand_name}] → ${inserted} INCI`);
    } else { no_match++; }
    found += (inserted >= MIN_INCI ? 1 : 0);

    await sleep(400);
  } catch (e) { no_match++; }

  if ((i + 1) % 25 === 0) console.log(`  [${i+1}/${targets.length}] restored:${restored} miss:${no_match}`);
}

console.log(`\n=== Done: ${restored} restored, ${no_match} no_match, ${new_ing} new_ingredients ===`);
await client.end();
