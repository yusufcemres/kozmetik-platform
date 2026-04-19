/**
 * Stage 0 (cosmetic) — PREFLIGHT.
 *
 * Parallel to preflight.ts (supplement). Only meaningful difference: we warn
 * when a category is registered with domain_type='supplement' instead of
 * 'cosmetic' — the supplement variant warns on the inverse. No DB writes.
 */
import type { CosmeticPipelineContext } from '../context-cosmetic';
import { CosmeticPipelineError } from '../context-cosmetic';

export async function runCosmeticPreflight(ctx: CosmeticPipelineContext): Promise<void> {
  const { client, doc, logger, resolved, plan } = ctx;
  logger.section('PREFLIGHT (taxonomy + dedupe + alias)');

  // ── Brand lookup / create plan ─────────────────────────────────────────────
  const brandRes = await client.query(
    `SELECT brand_id, brand_name FROM brands WHERE brand_slug = $1 LIMIT 1`,
    [doc.product.brand_slug],
  );
  if (brandRes.rowCount === 0) {
    if (!doc.brand_to_create) {
      throw new CosmeticPipelineError(
        'Stage 0',
        `brand_slug '${doc.product.brand_slug}' DB'de yok. JSON'a brand_to_create bloğu ekle.`,
      );
    }
    plan.create_brand = true;
    plan.summary_lines.push(
      `  + brands             : CREATE '${doc.brand_to_create.brand_slug}' (${doc.brand_to_create.brand_name})`,
    );
    logger.info(0, `Brand yeni: ${doc.brand_to_create.brand_slug} → Stage 3'te INSERT edilecek.`);
  } else {
    resolved.brand_id = brandRes.rows[0].brand_id;
    logger.ok(0, `Brand OK: ${doc.product.brand_slug} (id=${resolved.brand_id})`);
  }

  // ── Category lookup / create plan ──────────────────────────────────────────
  const catRes = await client.query(
    `SELECT category_id, category_name, domain_type FROM categories WHERE category_slug = $1 LIMIT 1`,
    [doc.product.category_slug],
  );
  if (catRes.rowCount === 0) {
    if (!doc.category_to_create) {
      throw new CosmeticPipelineError(
        'Stage 0',
        `category_slug '${doc.product.category_slug}' DB'de yok. JSON'a category_to_create bloğu ekle.`,
      );
    }
    plan.create_category = true;
    plan.summary_lines.push(
      `  + categories         : CREATE '${doc.category_to_create.category_slug}' (${doc.category_to_create.category_name})`,
    );
    logger.info(0, `Category yeni: ${doc.category_to_create.category_slug} → Stage 3'te INSERT edilecek.`);
  } else {
    resolved.category_id = catRes.rows[0].category_id;
    const cat = catRes.rows[0];
    if (cat.domain_type && cat.domain_type !== 'cosmetic') {
      logger.warn(
        0,
        `Category domain_type='${cat.domain_type}' — bu pipeline cosmetic için, kategori supplement olabilir. Doğru kategoriyi seçtiğinden emin ol.`,
      );
    }
    logger.ok(0, `Category OK: ${doc.product.category_slug} (id=${resolved.category_id})`);
  }

  // ── Dedupe: product_name + brand_id ────────────────────────────────────────
  if (resolved.brand_id) {
    const dupRes = await client.query(
      `SELECT product_id, product_name, status
         FROM products
        WHERE LOWER(product_name) = LOWER($1) AND brand_id = $2
        LIMIT 1`,
      [doc.product.product_name, resolved.brand_id],
    );
    if (dupRes.rowCount && dupRes.rowCount > 0) {
      const dup = dupRes.rows[0];
      throw new CosmeticPipelineError(
        'Stage 0',
        `Bu ürün zaten kayıtlı: product_id=${dup.product_id}, status=${dup.status}.`,
      );
    }
    logger.ok(0, `Dedupe OK: '${doc.product.product_name}' bu markada yok.`);
  }

  // ── Ingredient alias resolution + existence map ────────────────────────────
  const allSlugs = new Set<string>();
  doc.product.ingredients.forEach((ri) => allSlugs.add(ri.ingredient_slug));
  (doc.ingredients_to_create ?? []).forEach((ing) => allSlugs.add(ing.ingredient_slug));

  if (allSlugs.size === 0) return;

  const aliasRes = await client.query(
    `SELECT ia.alias_name, i.ingredient_slug
       FROM ingredient_aliases ia
       JOIN ingredients i ON ia.ingredient_id = i.ingredient_id
      WHERE LOWER(ia.alias_name) = ANY($1::text[])`,
    [Array.from(allSlugs).map((s) => s.toLowerCase())],
  );
  const aliasMap = new Map<string, string>();
  for (const row of aliasRes.rows) {
    aliasMap.set(row.alias_name.toLowerCase(), row.ingredient_slug);
  }
  if (aliasMap.size > 0) {
    for (const slug of Array.from(allSlugs)) {
      const canonical = aliasMap.get(slug.toLowerCase());
      if (canonical && canonical !== slug) {
        resolved.alias_translations.push({ input: slug, canonical });
        allSlugs.delete(slug);
        allSlugs.add(canonical);
        doc.product.ingredients.forEach((ri) => {
          if (ri.ingredient_slug === slug) ri.ingredient_slug = canonical;
        });
        (doc.ingredients_to_create ?? []).forEach((ing) => {
          if (ing.ingredient_slug === slug) ing.ingredient_slug = canonical;
        });
        logger.info(0, `Alias → canonical: '${slug}' → '${canonical}'`);
      }
    }
  }

  const existRes = await client.query(
    `SELECT ingredient_id, ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`,
    [Array.from(allSlugs)],
  );
  for (const row of existRes.rows) {
    resolved.ingredient_ids.set(row.ingredient_slug, row.ingredient_id);
  }
  const missing = Array.from(allSlugs).filter((s) => !resolved.ingredient_ids.has(s));
  const payloadSlugs = new Set((doc.ingredients_to_create ?? []).map((i) => i.ingredient_slug));
  const unresolvable = missing.filter((s) => !payloadSlugs.has(s));
  if (unresolvable.length > 0) {
    throw new CosmeticPipelineError(
      'Stage 0',
      `Bu slug'lar DB'de yok ve ingredients_to_create'te payload da yok: ${unresolvable.join(', ')}`,
    );
  }
  resolved.ingredients_to_create = (doc.ingredients_to_create ?? []).filter((i) =>
    missing.includes(i.ingredient_slug),
  );
  plan.create_ingredients_count = resolved.ingredients_to_create.length;

  logger.ok(
    0,
    `Ingredient map: ${resolved.ingredient_ids.size} mevcut, ${resolved.ingredients_to_create.length} yeni.`,
  );
}
