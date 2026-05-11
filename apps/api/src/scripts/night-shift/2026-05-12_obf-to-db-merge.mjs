/**
 * Gece vardiyasi 2026-05-12 — OBF fetch sonuclarini DB'ye merge.
 *
 * Her urun draft status'unde olusturulur (auto-publish YOK).
 * Brand fuzzy match: yoksa olustur. INCI fuzzy match: pg_trgm.
 * Mevcut barkodlu urun varsa enrich (yeni INCI ekle, pending_review).
 *
 * Usage: node src/scripts/night-shift/2026-05-12_obf-to-db-merge.mjs [--dry]
 */
import { readdir, readFile } from 'fs/promises';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const INPUT = './tmp/obf-results';

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

function turkishSlug(text) {
  return (text || '').toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function parseQuantity(qty) {
  if (!qty) return { value: null, unit: null };
  const m = String(qty).match(/(\d+(?:[.,]\d+)?)\s*(ml|g|gr|kg|l|tablet|kapsül|kapsul|adet|softgel)?/i);
  if (!m) return { value: null, unit: null };
  return {
    value: parseFloat(m[1].replace(',', '.')),
    unit: (m[2] || 'ml').toLowerCase(),
  };
}

await client.connect();
console.log(`=== OBF -> DB Merge (dry=${DRY}) ===\n`);

// INCI fuzzy match cache
const inciCache = new Map();
async function findInciByName(name) {
  const key = name.toLowerCase();
  if (inciCache.has(key)) return inciCache.get(key);
  const exact = await client.query(
    `SELECT ingredient_id FROM ingredients WHERE LOWER(inci_name) = LOWER($1) OR LOWER(COALESCE(common_name, '')) = LOWER($1) LIMIT 1`,
    [name],
  );
  if (exact.rows.length > 0) {
    inciCache.set(key, exact.rows[0].ingredient_id);
    return exact.rows[0].ingredient_id;
  }
  const fuzzy = await client.query(
    `SELECT ingredient_id, GREATEST(similarity(LOWER(inci_name), LOWER($1)), similarity(LOWER(COALESCE(common_name, '')), LOWER($1))) AS score
     FROM ingredients WHERE is_active = true AND (LOWER(inci_name) % LOWER($1) OR LOWER(COALESCE(common_name, '')) % LOWER($1))
     ORDER BY score DESC LIMIT 1`,
    [name],
  );
  if (fuzzy.rows.length > 0 && Number(fuzzy.rows[0].score) > 0.7) {
    inciCache.set(key, fuzzy.rows[0].ingredient_id);
    return fuzzy.rows[0].ingredient_id;
  }
  inciCache.set(key, null);
  return null;
}

const brandCache = new Map();
async function findOrCreateBrand(name) {
  if (!name) return null;
  const key = name.toLowerCase();
  if (brandCache.has(key)) return brandCache.get(key);
  const slug = turkishSlug(name);
  const exact = await client.query(
    `SELECT brand_id FROM brands WHERE LOWER(brand_name) = LOWER($1) OR brand_slug = $2 LIMIT 1`,
    [name, slug],
  );
  if (exact.rows.length > 0) {
    brandCache.set(key, exact.rows[0].brand_id);
    return exact.rows[0].brand_id;
  }
  const fuzzy = await client.query(
    `SELECT brand_id, similarity(LOWER(brand_name), LOWER($1)) AS score
     FROM brands WHERE LOWER(brand_name) % LOWER($1) ORDER BY score DESC LIMIT 1`,
    [name],
  );
  if (fuzzy.rows.length > 0 && Number(fuzzy.rows[0].score) > 0.7) {
    brandCache.set(key, fuzzy.rows[0].brand_id);
    return fuzzy.rows[0].brand_id;
  }
  if (DRY) {
    brandCache.set(key, -1);
    return -1;
  }
  const ins = await client.query(
    `INSERT INTO brands (brand_name, brand_slug, is_active, created_at, updated_at)
     VALUES ($1, $2, true, NOW(), NOW()) RETURNING brand_id`,
    [name, slug],
  );
  brandCache.set(key, ins.rows[0].brand_id);
  return ins.rows[0].brand_id;
}

const files = (await readdir(INPUT)).filter((f) => f.endsWith('.json') && f !== '_summary.json');
let stats = {
  files_processed: 0,
  new_products: 0,
  existing_matched: 0,
  new_brands: 0,
  inci_linked: 0,
  inci_unmatched: 0,
  pending_proposals: 0,
  skipped: 0,
};

for (const f of files) {
  let data;
  try {
    data = JSON.parse(await readFile(join(INPUT, f), 'utf-8'));
  } catch (e) {
    console.log(`SKIP ${f}: invalid JSON`);
    continue;
  }
  if (!data || !Array.isArray(data.products)) {
    console.log(`SKIP ${f}: no products array`);
    continue;
  }
  stats.files_processed++;
  console.log(`\n=== ${data.brand_slug || f} — ${data.products.length} urun ===`);

  for (const p of data.products) {
    if (!p.barcode || !p.product_name) {
      stats.skipped++;
      continue;
    }
    const bc = String(p.barcode).replace(/\D/g, '');
    if (bc.length < 8) {
      stats.skipped++;
      continue;
    }

    // Mevcut barcode check
    const existing = await client.query(`SELECT product_id FROM products WHERE barcode = $1 LIMIT 1`, [bc]);
    let productId = existing.rows[0]?.product_id;

    const brandId = await findOrCreateBrand(p.brand_name);
    if (brandId === -1) continue;

    if (productId) {
      stats.existing_matched++;
      // Enrich: yeni INCI'leri pending_review olarak ekle
      if (p.ingredients_list?.length > 0) {
        const existingInci = await client.query(
          `SELECT ingredient_id FROM product_ingredients WHERE product_id = $1 AND ingredient_id IS NOT NULL`,
          [productId],
        );
        const existingIds = new Set(existingInci.rows.map((r) => r.ingredient_id));
        const maxRank = (await client.query(`SELECT COALESCE(MAX(inci_order_rank), 0) AS m FROM product_ingredients WHERE product_id = $1`, [productId])).rows[0].m;
        let rank = maxRank;
        for (const name of p.ingredients_list) {
          const ingId = await findInciByName(name);
          if (ingId && !existingIds.has(ingId)) {
            rank++;
            if (!DRY) {
              await client.query(
                `INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims, match_status, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, 'unknown', false, false, 'pending_review', NOW(), NOW())`,
                [productId, ingId, name, rank],
              );
            }
            stats.pending_proposals++;
          }
        }
      }
    } else {
      // YENI URUN
      stats.new_products++;
      if (!DRY && brandId) {
        const qty = parseQuantity(p.net_content);
        const slug = turkishSlug(`${p.brand_name} ${p.product_name}`).slice(0, 80) + '-' + bc.slice(-4);
        const ins = await client.query(
          `INSERT INTO products (brand_id, category_id, product_name, product_slug, short_description, barcode, net_content_value, net_content_unit, domain_type, status, target_audience, created_at, updated_at)
           VALUES ($1, 1, $2, $3, $4, $5, $6, $7, 'cosmetic', 'draft', 'adult', NOW(), NOW())
           RETURNING product_id`,
          [
            brandId,
            p.product_name,
            slug,
            `${p.brand_name || ''} ${p.product_name || ''} — OpenBeautyFacts'ten eklendi (kaynak: ${data.brand_slug}).`,
            bc,
            qty.value,
            qty.unit,
          ],
        );
        productId = ins.rows[0].product_id;
        // INCI eslesti -> direkt matched (yeni urun, baska veri yok, OBF'den geliyor)
        if (p.ingredients_list?.length > 0) {
          let rank = 0;
          for (const name of p.ingredients_list) {
            const ingId = await findInciByName(name);
            rank++;
            if (ingId) {
              await client.query(
                `INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims, match_status, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, 'unknown', false, false, 'auto_matched', NOW(), NOW())`,
                [productId, ingId, name, rank],
              );
              stats.inci_linked++;
            } else {
              stats.inci_unmatched++;
            }
          }
        }
        // Image
        if (p.image_url) {
          await client.query(
            `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, created_at)
             VALUES ($1, $2, $3, 0, NOW())`,
            [productId, p.image_url, p.product_name],
          );
        }
      }
    }
  }
}

console.log(`\n=== Stats ===`);
console.table(stats);
await client.end();
