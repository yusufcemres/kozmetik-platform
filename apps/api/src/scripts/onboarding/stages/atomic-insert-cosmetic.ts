/**
 * Stage 3 (cosmetic) — ATOMIC_INSERT.
 *
 * Parallel to atomic-insert.ts (supplement). Key differences from supplement:
 *   - ingredients INSERT carries cir_status / cmr_class / safety_class /
 *     efficacy_conc_* / eu_* columns (not elemental_ratio / UL / evidence_grade).
 *   - products INSERT sets domain_type='cosmetic' and writes product_type_label
 *     + target_area + usage_time_hint. No target_audience override (stays
 *     default 'adult' — cosmetic audience is handled via claims, not scoring).
 *   - No supplement_details / supplement_ingredients rows. The per-product
 *     ingredient join is product_ingredients ONLY, carrying inci_order_rank
 *     and concentration_percent.
 *
 * Single BEGIN/COMMIT; any exception triggers ROLLBACK.
 */
import type { CosmeticPipelineContext } from '../context-cosmetic';
import { CosmeticPipelineError } from '../context-cosmetic';
import { slugify } from '../slug';

export async function runCosmeticAtomicInsert(ctx: CosmeticPipelineContext): Promise<void> {
  const { client, doc, logger, resolved, plan } = ctx;
  logger.section('ATOMIC_INSERT (pg transaction, cosmetic)');

  await client.query('BEGIN');
  try {
    // 1. brand
    let brandId = resolved.brand_id;
    if (plan.create_brand && doc.brand_to_create) {
      const b = doc.brand_to_create;
      const res = await client.query(
        `INSERT INTO brands (brand_name, brand_slug, country_of_origin, is_active)
         VALUES ($1, $2, $3, true)
         RETURNING brand_id`,
        [b.brand_name, b.brand_slug, b.country ?? null],
      );
      brandId = res.rows[0].brand_id;
      logger.info(3, `brands: INSERT '${b.brand_slug}' → id=${brandId}`);
    }
    if (!brandId) throw new CosmeticPipelineError('Stage 3', 'brand_id çözümlenemedi.');

    // 2. category
    let categoryId = resolved.category_id;
    if (plan.create_category && doc.category_to_create) {
      const c = doc.category_to_create;
      const res = await client.query(
        `INSERT INTO categories (category_name, category_slug, domain_type, is_active)
         VALUES ($1, $2, 'cosmetic', true)
         RETURNING category_id`,
        [c.category_name, c.category_slug],
      );
      categoryId = res.rows[0].category_id;
      logger.info(3, `categories: INSERT '${c.category_slug}' → id=${categoryId}`);
    }
    if (!categoryId) throw new CosmeticPipelineError('Stage 3', 'category_id çözümlenemedi.');

    // 3. ingredients (cosmetic shape)
    for (const ing of resolved.ingredients_to_create) {
      const res = await client.query(
        `INSERT INTO ingredients
           (domain_type, inci_name, common_name, ingredient_slug, ingredient_group,
            function_summary, sensitivity_note, safety_note, safety_class,
            allergen_flag, fragrance_flag, preservative_flag,
            cir_status, sccs_opinion_ref, cmr_class, iarc_group,
            efficacy_conc_min, efficacy_conc_max, eu_annex_iii_limit,
            endocrine_flag, eu_banned, eu_restricted, is_active)
         VALUES ('cosmetic',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,true)
         RETURNING ingredient_id`,
        [
          ing.inci_name,
          ing.common_name ?? null,
          ing.ingredient_slug,
          ing.ingredient_group ?? null,
          ing.function_summary ?? null,
          ing.sensitivity_note ?? null,
          ing.safety_note ?? null,
          ing.safety_class ?? 'neutral',
          ing.allergen_flag ?? false,
          ing.fragrance_flag ?? false,
          ing.preservative_flag ?? false,
          ing.cir_status ?? null,
          ing.sccs_opinion_ref ?? null,
          ing.cmr_class ?? null,
          ing.iarc_group ?? null,
          ing.efficacy_conc_min ?? null,
          ing.efficacy_conc_max ?? null,
          ing.eu_annex_iii_limit ?? null,
          ing.endocrine_flag ?? false,
          ing.eu_banned ?? false,
          ing.eu_restricted ?? false,
        ],
      );
      const id = res.rows[0].ingredient_id;
      resolved.ingredient_ids.set(ing.ingredient_slug, id);
      logger.info(3, `ingredients: INSERT '${ing.ingredient_slug}' → id=${id}`);
    }

    // 4. products (no supplement_details row)
    const productSlug = resolved.product_slug ?? slugify(doc.product.product_name);
    const prodRes = await client.query(
      `INSERT INTO products
         (brand_id, category_id, domain_type, product_name, product_slug, short_description,
          net_content_value, net_content_unit, product_type_label, target_area, usage_time_hint,
          target_gender, status)
       VALUES ($1,$2,'cosmetic',$3,$4,$5,$6,$7,$8,$9,$10,$11,'draft')
       RETURNING product_id`,
      [
        brandId,
        categoryId,
        doc.product.product_name,
        productSlug,
        doc.product.short_description ?? null,
        doc.product.net_content_value ?? null,
        doc.product.net_content_unit ?? null,
        doc.product.product_type_label ?? null,
        doc.product.target_area ?? null,
        doc.product.usage_time_hint ?? null,
        doc.product.target_gender ?? null,
      ],
    );
    const productId: number = prodRes.rows[0].product_id;
    ctx.product_id = productId;
    logger.info(3, `products: INSERT '${productSlug}' → id=${productId}`);

    // 4b. product_ingredients (cosmetic: inci_order_rank + concentration_percent)
    for (const ri of doc.product.ingredients) {
      const ingId = resolved.ingredient_ids.get(ri.ingredient_slug);
      if (!ingId) throw new CosmeticPipelineError('Stage 3', `ingredient_id yok: ${ri.ingredient_slug}`);

      const nameRow = await client.query(
        `SELECT COALESCE(common_name, inci_name) AS display_name FROM ingredients WHERE ingredient_id = $1`,
        [ingId],
      );
      const displayName = nameRow.rows[0].display_name;

      await client.query(
        `INSERT INTO product_ingredients
           (product_id, ingredient_id, ingredient_display_name, inci_order_rank,
            concentration_percent, concentration_source,
            is_highlighted_in_claims, match_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'manual')`,
        [
          productId,
          ingId,
          displayName,
          ri.inci_order_rank,
          ri.concentration_percent ?? null,
          ri.concentration_percent != null ? 'manufacturer' : null,
          ri.is_highlighted_in_claims ?? false,
        ],
      );
    }

    // 5. product_images
    if (resolved.image_url) {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text)
         VALUES ($1,$2,'primary',1,$3)`,
        [productId, resolved.image_url, doc.product.product_name.slice(0, 190)],
      );
    }

    // 6. affiliate_links
    await client.query(
      `INSERT INTO affiliate_links (product_id, platform, affiliate_url, verification_status, is_active)
       VALUES ($1,$2,$3,$4,true)`,
      [
        productId,
        doc.product.affiliate_platform ?? 'trendyol',
        doc.product.affiliate_url,
        resolved.affiliate_verification_status ?? 'unverified',
      ],
    );

    await client.query('COMMIT');
    logger.ok(3, `COMMIT OK (product_id=${productId})`);
  } catch (e: any) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore rollback error */
    }
    if (e instanceof CosmeticPipelineError) throw e;
    throw new CosmeticPipelineError('Stage 3', `INSERT başarısız, ROLLBACK yapıldı: ${e?.message ?? e}`);
  }

  await postCommitAssertions(ctx);
}

async function postCommitAssertions(ctx: CosmeticPipelineContext): Promise<void> {
  const { client, logger } = ctx;
  const pid = ctx.product_id!;
  const piCount = await client.query(
    `SELECT COUNT(*)::int AS c FROM product_ingredients WHERE product_id=$1`,
    [pid],
  );
  const alCount = await client.query(
    `SELECT COUNT(*)::int AS c FROM affiliate_links WHERE product_id=$1`,
    [pid],
  );
  const expectedIngs = ctx.doc.product.ingredients.length;
  if (piCount.rows[0].c !== expectedIngs) {
    throw new CosmeticPipelineError(
      'Stage 3 post-commit',
      `product_ingredients satır sayısı ${piCount.rows[0].c}, beklenen ${expectedIngs}.`,
    );
  }
  if (alCount.rows[0].c < 1) {
    throw new CosmeticPipelineError('Stage 3 post-commit', 'affiliate_links satırı bulunamadı.');
  }
  logger.ok(3, `Post-commit assertion OK (pi=${piCount.rows[0].c}, al=${alCount.rows[0].c})`);
}
