/**
 * Generic NEW product inserter — JSON manifest'ten yeni ürün ekler (verified data only).
 *
 * Manifest format:
 * {
 *   "_source_note": "...",
 *   "products": [
 *     {
 *       "product_name": "...",
 *       "product_slug": "...",  // optional — name'den auto-generate
 *       "brand_slug": "beauty-of-joseon",
 *       "domain_type": "cosmetic",
 *       "category_slug": "serum-ampul",  // optional
 *       "short_description": "...",
 *       "net_content_value": 30,
 *       "net_content_unit": "ml",
 *       "target_area": "face",
 *       "product_type_label": "Yüz Serumu",
 *       "inci": [
 *         {"display_name": "Water", "slug": "water"},  // slug auto-resolved if null
 *         ...
 *       ],
 *       "usage": "...",
 *       "warning": "...",
 *       "claims": ["..."],
 *       "image_url": "https://...",
 *       "source_url": "https://...",  // raporlama için
 *       "external_source_name": "Beauty of Joseon (Resmi)"
 *     }
 *   ]
 * }
 *
 * Pipeline:
 *  1) Brand + category lookup
 *  2) Ingredient slug lookup (auto-resolve from INCI name if slug missing)
 *  3) INSERT products (skip if slug exists)
 *  4) INSERT product_ingredients (ingredient_display_name preserves brand-given INCI name)
 *  5) INSERT product_labels (usage/warning/claims)
 *  6) INSERT product_images (image_url + alt_text + source attribution)
 *  7) Recompute need_scores + top_need
 *  8) INSERT product_scores (cosmetic-v1 default 75/B until admin recalculates)
 *
 * Kullanım:
 *   node insert-new-products-batch.mjs --manifest=manifests/x.json           # dry-run
 *   node insert-new-products-batch.mjs --manifest=manifests/x.json --apply
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

function getArg(name, def = null) {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.slice(`--${name}=`.length) : def;
}

function turkishSlug(s) {
  return s.toLowerCase()
    .replaceAll('ı', 'i').replaceAll('İ', 'i')
    .replaceAll('ö', 'o').replaceAll('Ö', 'o')
    .replaceAll('ü', 'u').replaceAll('Ü', 'u')
    .replaceAll('ç', 'c').replaceAll('Ç', 'c')
    .replaceAll('ş', 's').replaceAll('Ş', 's')
    .replaceAll('ğ', 'g').replaceAll('Ğ', 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inciToSlug(name) {
  // "Sodium Hyaluronate" → "sodium-hyaluronate"
  // "Caprylic/Capric Triglyceride" → "caprylic-capric-triglyceride"
  return name.toLowerCase()
    .replace(/\(.*?\)/g, '')         // strip parentheticals
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function bandFromPosition(pos, total) {
  if (pos === 1) return 'very_high';
  if (pos <= 3) return 'high';
  if (pos <= Math.ceil(total * 0.4)) return 'medium';
  if (pos <= Math.ceil(total * 0.7)) return 'low';
  return 'trace';
}

async function insertOne(client, p, brandMap, catMap, ingMap) {
  const brand = brandMap.get(p.brand_slug);
  if (!brand) throw new Error(`Brand not found: ${p.brand_slug}`);

  const slug = p.product_slug || turkishSlug(`${brand.brand_name}-${p.product_name}`);
  const exists = await client.query(`SELECT product_id FROM products WHERE product_slug = $1`, [slug]);
  if (exists.rows.length) {
    return { skipped: true, product_id: exists.rows[0].product_id, slug };
  }

  const catId = p.category_slug ? catMap.get(p.category_slug) : null;

  const productRes = await client.query(
    `INSERT INTO products
       (product_name, product_slug, brand_id, category_id, domain_type, short_description,
        net_content_value, net_content_unit, target_area, product_type_label,
        status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'published', NOW(), NOW())
     RETURNING product_id`,
    [
      p.product_name,
      slug,
      brand.brand_id,
      catId,
      p.domain_type || 'cosmetic',
      p.short_description || null,
      p.net_content_value || null,
      p.net_content_unit || null,
      p.target_area || null,
      p.product_type_label || null,
    ],
  );
  const productId = productRes.rows[0].product_id;

  const total = p.inci.length;
  let order = 0;
  let matched = 0;
  for (const ing of p.inci) {
    order++;
    const slugGuess = ing.slug || inciToSlug(ing.display_name || ing.display);
    const ingId = ingMap.get(slugGuess) || null;
    if (ingId) matched++;
    const band = ing.band || bandFromPosition(order, total);
    await client.query(
      `INSERT INTO product_ingredients
         (product_id, ingredient_id, ingredient_display_name, inci_order_rank,
          concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims,
          match_status, match_confidence, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
      [
        productId,
        ingId,
        ing.display_name || ing.display,
        order,
        band,
        band === 'trace' || band === 'low',
        !!ing.highlighted,
        ingId ? 'matched' : 'unmatched',
        ingId ? 0.95 : 0.5,
      ],
    );
  }

  if (p.usage || p.warning || p.claims) {
    await client.query(
      `INSERT INTO product_labels (product_id, usage_instructions, warning_text, claim_texts_json, net_content_display, created_at, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, NOW(), NOW())`,
      [
        productId,
        p.usage || null,
        p.warning || null,
        JSON.stringify(p.claims || []),
        p.net_content_value && p.net_content_unit ? `${p.net_content_value} ${p.net_content_unit}` : null,
      ],
    );
  }

  if (p.image_url) {
    await client.query(
      `INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text, created_at)
       VALUES ($1, $2, 'product', 0, $3, NOW())`,
      [productId, p.image_url, p.product_name],
    );
  }

  return { skipped: false, product_id: productId, slug, matched, total };
}

async function recomputeScores(client, productIds) {
  if (!productIds.length) return;

  // Need scores — mevcut cosmetic algoritması (_cosmetic-fill-missing-scores.sql ile aynı)
  // Tüm effect_type'ları dahil eder, ağırlıklı ortalama alır.
  await client.query(
    `INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, score_reason_summary, calculated_at)
     SELECT
       pi.product_id,
       inm.need_id,
       ROUND(AVG(inm.relevance_score * CASE inm.effect_type
         WHEN 'direct_support'   THEN 1.00
         WHEN 'indirect_support' THEN 0.75
         WHEN 'complementary'    THEN 0.55
         WHEN 'caution_related'  THEN 0.25
         ELSE 0.50
       END))::numeric(5,2),
       CASE WHEN COUNT(*) >= 4 THEN 'high' WHEN COUNT(*) >= 2 THEN 'medium' ELSE 'low' END,
       COUNT(*) || ' bileşen bu ihtiyaca katkı sağlıyor',
       NOW()
     FROM product_ingredients pi
     JOIN products p ON p.product_id = pi.product_id
     JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
     JOIN needs n ON n.need_id = inm.need_id
     WHERE pi.product_id = ANY($1::int[])
       AND n.domain_type IN ('cosmetic','both')
     GROUP BY pi.product_id, inm.need_id
     HAVING AVG(inm.relevance_score) >= 25`,
    [productIds],
  );

  await client.query(
    `UPDATE products p SET top_need_name = sub.need_name, top_need_score = sub.compatibility_score
     FROM (SELECT DISTINCT ON (ns.product_id) ns.product_id, n.need_name, ns.compatibility_score
           FROM product_need_scores ns JOIN needs n ON n.need_id = ns.need_id
           WHERE ns.product_id = ANY($1::int[])
           ORDER BY ns.product_id, ns.compatibility_score DESC) sub
     WHERE p.product_id = sub.product_id`,
    [productIds],
  );

  await client.query(
    `INSERT INTO product_scores (product_id, algorithm_version, overall_score, grade, breakdown, explanation, flags, computed_at)
     SELECT p.product_id, 'cosmetic-v1', 75, 'B',
            '{"safety": 80, "efficacy": 70, "transparency": 75, "evidence": 70, "value": 75}'::jsonb,
            '[]'::jsonb,
            '{"allergens": [], "fragrances": [], "harmful": [], "cmr": [], "endocrine": [], "eu_banned": []}'::jsonb,
            NOW()
     FROM products p WHERE p.product_id = ANY($1::int[])
     ON CONFLICT (product_id, algorithm_version) DO NOTHING`,
    [productIds],
  );
}

async function main() {
  const apply = process.argv.includes('--apply');
  const manifestArg = getArg('manifest');
  if (!manifestArg) { console.error('--manifest=path gerekli'); process.exit(1); }
  const manifestPath = isAbsolute(manifestArg) ? manifestArg : resolve(__dirname, manifestArg);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.products) || !manifest.products.length) {
    console.error('Manifest empty.'); process.exit(1);
  }

  const url = process.env.DATABASE_URL;
  const client = new Client({ connectionString: url, ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined });
  await client.connect();

  try {
    const brandSlugs = Array.from(new Set(manifest.products.map((p) => p.brand_slug)));
    const brandRes = await client.query(`SELECT brand_id, brand_slug, brand_name FROM brands WHERE brand_slug = ANY($1::text[])`, [brandSlugs]);
    const brandMap = new Map(brandRes.rows.map((r) => [r.brand_slug, r]));

    const catSlugs = Array.from(new Set(manifest.products.map((p) => p.category_slug).filter(Boolean)));
    const catMap = new Map();
    if (catSlugs.length) {
      const catRes = await client.query(`SELECT category_id, category_slug FROM categories WHERE category_slug = ANY($1::text[])`, [catSlugs]);
      for (const r of catRes.rows) catMap.set(r.category_slug, r.category_id);
    }

    // Collect ALL slugs to lookup (explicit + auto-resolved from INCI names)
    const allSlugs = new Set();
    for (const p of manifest.products) {
      for (const ing of p.inci) {
        allSlugs.add(ing.slug || inciToSlug(ing.display_name || ing.display));
      }
    }
    const ingRes = await client.query(`SELECT ingredient_id, ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`, [Array.from(allSlugs)]);
    const ingMap = new Map(ingRes.rows.map((r) => [r.ingredient_slug, r.ingredient_id]));

    console.log(`Brands found: ${brandMap.size}/${brandSlugs.length}`);
    console.log(`Categories found: ${catMap.size}/${catSlugs.length}`);
    console.log(`Ingredients matched: ${ingMap.size}/${allSlugs.size}`);

    if (!apply) {
      console.log('\n[DRY-RUN]');
      for (const p of manifest.products) {
        const slug = p.product_slug || turkishSlug(`${brandMap.get(p.brand_slug)?.brand_name || p.brand_slug}-${p.product_name}`);
        console.log(`  - [${p.brand_slug}] ${p.product_name} → slug=${slug}, ${p.inci.length} INCI, image:${p.image_url ? 'Y' : 'N'}, claims:${p.claims?.length || 0}`);
      }
      console.log('\n--apply ekle.');
      return;
    }

    let inserted = 0, skipped = 0;
    const newIds = [];
    for (const p of manifest.products) {
      try {
        await client.query('BEGIN');
        const r = await insertOne(client, p, brandMap, catMap, ingMap);
        await client.query('COMMIT');
        if (r.skipped) {
          skipped++;
          console.log(`  SKIP (exists): ${r.slug} → product_id=${r.product_id}`);
        } else {
          inserted++;
          newIds.push(r.product_id);
          console.log(`  OK: [${r.product_id}] ${r.slug} (${r.matched}/${r.total} INCI matched)`);
        }
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error(`  FAIL [${p.product_name}]: ${err.message}`);
      }
    }

    if (newIds.length) {
      console.log(`\nRecomputing scores for ${newIds.length} new products...`);
      await client.query('BEGIN');
      await recomputeScores(client, newIds);
      await client.query('COMMIT');
    }

    console.log(`\nDone: ${inserted} inserted, ${skipped} skipped (already existed)`);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
