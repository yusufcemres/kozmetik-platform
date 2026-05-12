/**
 * OpenBeautyFacts API'den archived INCI=0 ürünler için INCI çek.
 * 1. OBF'ta marka+ad ile arama → en iyi eşleşmeyi bul
 * 2. INCI listesini parse et
 * 3. ingredients tablosuyla eşleştir (inci_name ILIKE), olmayan için yeni kayıt oluştur
 * 4. product_ingredients'a ekle
 * 5. Başarılıysa product'ı draft'a çevir (auto-publish zaten çalıştıracak)
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '200');
const MIN_INCI = parseInt(process.argv.find(a => a.startsWith('--min-inci='))?.split('=')[1] || '3');
const BRAND_FILTER = process.argv.find(a => a.startsWith('--brand='))?.split('=').slice(1).join('=');

const client = new Client({ connectionString: process.env.DATABASE_URL });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeInci(s) {
  return s.trim().toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[*†‡§¶]/g, '') // footnote markers
    .trim();
}

function stringSimilarity(a, b) {
  // Simple token overlap similarity
  const ta = new Set(a.toLowerCase().split(/\s+/));
  const tb = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...ta].filter(x => tb.has(x)).length;
  return intersection / Math.max(ta.size, tb.size);
}

async function searchOBF(brand, productName) {
  try {
    const q = `${brand} ${productName}`.trim().substring(0, 80);
    const url = `https://world.openbeautyfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(q)}&json=1&page_size=10&fields=product_name,brands,ingredients_text`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const data = await res.json();
    const products = data.products || [];
    if (!products.length) return null;

    // Score each result by name similarity
    let best = null, bestScore = 0;
    for (const p of products) {
      const score = stringSimilarity(productName, p.product_name || '');
      if (score > bestScore) { bestScore = score; best = p; }
    }
    if (bestScore < 0.15) return null; // Too low similarity
    return best;
  } catch { return null; }
}

function parseInciList(ingrText) {
  if (!ingrText) return [];
  // Split by comma, handle parentheses (nested INCI like "parfum (limonene, linalool)")
  // Simple approach: split by ',' and clean up
  const raw = ingrText
    .replace(/\(([^)]+)\)/g, '') // remove parenthetical sub-ingredients
    .split(',')
    .map(s => normalizeInci(s))
    .filter(s => s.length >= 2 && s.length <= 120)
    .filter(s => !/^\d+$/.test(s)); // remove pure numbers
  return [...new Set(raw)]; // deduplicate
}

await client.connect();

// Load all existing INCI slugs/names into memory for fast lookup
const { rows: allInci } = await client.query(`
  SELECT ingredient_id, inci_name, ingredient_slug FROM ingredients WHERE domain_type='cosmetic' AND is_active=true
`);
const inciBySlug = new Map(allInci.map(r => [r.ingredient_slug, r.ingredient_id]));
const inciByName = new Map(allInci.map(r => [normalizeInci(r.inci_name), r.ingredient_id]));
console.log(`Loaded ${allInci.length} existing INCI from DB\n`);

// Targets: archived INCI=0 cosmetics
let brandClause = '';
const params = [LIMIT];
if (BRAND_FILTER) {
  params.push(`%${BRAND_FILTER}%`);
  brandClause = `AND b.brand_name ILIKE $${params.length}`;
}

const { rows: targets } = await client.query(`
  SELECT p.product_id, p.product_name, b.brand_name
  FROM products p
  JOIN brands b ON b.brand_id = p.brand_id
  WHERE p.status = 'archived' AND p.domain_type = 'cosmetic'
    AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id = p.product_id)
    ${brandClause}
  ORDER BY b.brand_name, p.product_id
  LIMIT $1
`, params);

console.log(`Targets: ${targets.length}${BRAND_FILTER ? ' (brand: ' + BRAND_FILTER + ')' : ''}\n`);

let obf_found = 0, inci_added = 0, products_restored = 0, no_match = 0;
let new_ingredients_created = 0;

for (let i = 0; i < targets.length; i++) {
  const p = targets[i];
  try {
    const obf = await searchOBF(p.brand_name || '', p.product_name);
    if (!obf) { no_match++; continue; }

    const inciList = parseInciList(obf.ingredients_text || '');
    if (inciList.length < MIN_INCI) { no_match++; continue; }

    obf_found++;
    let inserted = 0;

    for (let rank = 0; rank < inciList.length; rank++) {
      const inciName = inciList[rank];
      const slug = slugify(inciName);

      // Try to find existing ingredient
      let ingredientId = inciByName.get(inciName) || inciBySlug.get(slug);

      if (!ingredientId) {
        // Try partial slug match (handles minor variations)
        const slugWords = slug.split('-').filter(w => w.length > 3);
        if (slugWords.length >= 2) {
          for (const [s, id] of inciBySlug) {
            if (slugWords.every(w => s.includes(w))) { ingredientId = id; break; }
          }
        }
      }

      if (!ingredientId) {
        // Create new ingredient (minimal, auto-enrichment later)
        const displayName = inciName.charAt(0).toUpperCase() + inciName.slice(1);
        const newSlug = slug + '-obf';
        try {
          const { rows: newIng } = await client.query(`
            INSERT INTO ingredients (
              domain_type, inci_name, common_name, ingredient_slug,
              allergen_flag, fragrance_flag, preservative_flag, is_active,
              enrichment_source, created_at, updated_at
            ) VALUES (
              'cosmetic', $1, $2, $3,
              false, false, false, true,
              'openbeautyfacts', NOW(), NOW()
            ) ON CONFLICT (ingredient_slug) DO UPDATE
              SET updated_at = NOW()
            RETURNING ingredient_id
          `, [displayName, displayName, newSlug]);
          ingredientId = newIng[0]?.ingredient_id;
          if (ingredientId) {
            inciBySlug.set(newSlug, ingredientId);
            inciByName.set(inciName, ingredientId);
            new_ingredients_created++;
          }
        } catch { continue; }
      }

      if (!ingredientId) continue;

      try {
        await client.query(`
          INSERT INTO product_ingredients (
            product_id, ingredient_id, ingredient_display_name,
            inci_order_rank, listed_as_raw, match_status, match_confidence,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, 'matched', 85, NOW(), NOW())
          ON CONFLICT DO NOTHING
        `, [p.product_id, ingredientId, inciList[rank],
            rank + 1, inciList[rank]]);
        inserted++;
      } catch { /* conflict or error — skip */ }
    }

    inci_added += inserted;

    if (inserted >= MIN_INCI) {
      // Restore to draft for re-evaluation
      await client.query(`
        UPDATE products SET status='draft', updated_at=NOW() WHERE product_id=$1
      `, [p.product_id]);
      products_restored++;
      if (products_restored % 10 === 0 || inserted >= 10) {
        console.log(`✓ #${p.product_id} ${p.product_name?.substring(0,35)} [${p.brand_name}] → ${inserted} INCI`);
      }
    }

    await sleep(300);
  } catch (e) {
    console.log(`✗ #${p.product_id}: ${e.message?.substring(0,60)}`);
  }

  if ((i + 1) % 50 === 0) {
    console.log(`  [${i+1}/${targets.length}] found:${obf_found} restored:${products_restored} miss:${no_match}`);
  }
}

console.log(`
=== Done ===
OBF matches:     ${obf_found}
Products draft:  ${products_restored}
INCI inserted:   ${inci_added}
New ingredients: ${new_ingredients_created}
No match:        ${no_match}
`);
await client.end();
