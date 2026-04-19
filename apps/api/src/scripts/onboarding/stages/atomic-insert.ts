/**
 * Stage 3 — ATOMIC_INSERT.
 *
 * All DB writes happen here, wrapped in a single BEGIN/COMMIT. Any exception
 * triggers ROLLBACK — we never leave a half-inserted product.
 *
 * Write order:
 *   1. brands (if create_brand)
 *   2. categories (if create_category)
 *   3. ingredients (bulk insert for ingredients_to_create)
 *   4. products + supplement_details + supplement_ingredients + product_ingredients
 *   5. product_images (if image_url resolved)
 *   6. affiliate_links (trendyol primary)
 *
 * Post-commit: SELECT product + detail + ingredient counts; assert expected
 * rows exist. If any assertion fails, mark failure (but note — we're already
 * committed, cleanup is a separate tool).
 */
import type { PipelineContext } from '../context';
import { PipelineError } from '../context';
import { slugify } from '../slug';

export async function runAtomicInsert(ctx: PipelineContext): Promise<void> {
  const { client, doc, logger, resolved, plan } = ctx;
  logger.section('ATOMIC_INSERT (pg transaction)');

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
    if (!brandId) throw new PipelineError('Stage 3', 'brand_id çözümlenemedi.');

    // 2. category
    let categoryId = resolved.category_id;
    if (plan.create_category && doc.category_to_create) {
      const c = doc.category_to_create;
      const res = await client.query(
        `INSERT INTO categories (category_name, category_slug, domain_type, is_active)
         VALUES ($1, $2, $3, true)
         RETURNING category_id`,
        [c.category_name, c.category_slug, c.domain_type ?? 'supplement'],
      );
      categoryId = res.rows[0].category_id;
      logger.info(3, `categories: INSERT '${c.category_slug}' → id=${categoryId}`);
    }
    if (!categoryId) throw new PipelineError('Stage 3', 'category_id çözümlenemedi.');

    // 3. ingredients
    for (const ing of resolved.ingredients_to_create) {
      const res = await client.query(
        `INSERT INTO ingredients
           (domain_type, inci_name, common_name, ingredient_slug, ingredient_group,
            function_summary, evidence_grade, evidence_citations,
            effective_dose_min, effective_dose_max, effective_dose_unit, ul_dose, elemental_ratio,
            form_type, bioavailability_score, safety_class, food_sources, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,true)
         RETURNING ingredient_id`,
        [
          ing.domain_type ?? 'supplement',
          ing.inci_name,
          ing.common_name,
          ing.ingredient_slug,
          (ing as any).ingredient_group ?? null,
          ing.function_summary,
          ing.evidence_grade,
          JSON.stringify(ing.evidence_citations ?? []),
          ing.effective_dose_min ?? null,
          ing.effective_dose_max ?? null,
          ing.effective_dose_unit ?? null,
          ing.ul_dose ?? null,
          ing.elemental_ratio ?? null,
          ing.form_type ?? null,
          ing.bioavailability_score ?? null,
          ing.safety_class ?? 'neutral',
          ing.food_sources ? JSON.stringify(ing.food_sources) : null,
        ],
      );
      const id = res.rows[0].ingredient_id;
      resolved.ingredient_ids.set(ing.ingredient_slug, id);
      logger.info(3, `ingredients: INSERT '${ing.ingredient_slug}' → id=${id}`);
    }

    // 4. products
    const productSlug = resolved.product_slug ?? slugify(doc.product.product_name);
    const prodRes = await client.query(
      `INSERT INTO products
         (brand_id, category_id, domain_type, product_name, product_slug, short_description,
          net_content_value, net_content_unit, status)
       VALUES ($1,$2,'supplement',$3,$4,$5,$6,$7,'draft')
       RETURNING product_id`,
      [
        brandId,
        categoryId,
        doc.product.product_name,
        productSlug,
        doc.product.short_description ?? null,
        doc.product.net_content_value ?? null,
        doc.product.net_content_unit ?? null,
      ],
    );
    const productId: number = prodRes.rows[0].product_id;
    ctx.product_id = productId;
    logger.info(3, `products: INSERT '${productSlug}' → id=${productId}`);

    // 4b. supplement_details
    const sd = doc.product.supplement_detail;
    await client.query(
      `INSERT INTO supplement_details
         (product_id, form, serving_size, serving_unit, certification, manufacturer_country)
       VALUES ($1,$2,$3,$4,$5,'TR')`,
      [productId, sd.form, sd.serving_size ?? null, sd.serving_unit ?? null, sd.certification ?? null],
    );

    // 4c. supplement_ingredients + product_ingredients (parallel rows)
    for (let i = 0; i < doc.product.ingredients.length; i++) {
      const ri = doc.product.ingredients[i];
      const ingId = resolved.ingredient_ids.get(ri.ingredient_slug);
      if (!ingId) throw new PipelineError('Stage 3', `ingredient_id yok: ${ri.ingredient_slug}`);
      const dvClamped = ri.daily_value_percentage == null ? null : Math.min(Number(ri.daily_value_percentage), 9999.9);
      const highlight = i < 3; // first 3 are displayed in claims

      await client.query(
        `INSERT INTO supplement_ingredients
           (product_id, ingredient_id, amount_per_serving, unit, daily_value_percentage, is_proprietary_blend, sort_order)
         VALUES ($1,$2,$3,$4,$5,false,$6)`,
        [productId, ingId, ri.amount_per_serving, ri.unit, dvClamped, i + 1],
      );

      const nameRow = await client.query(
        `SELECT COALESCE(common_name, inci_name) AS display_name FROM ingredients WHERE ingredient_id = $1`,
        [ingId],
      );
      const displayName = nameRow.rows[0].display_name;
      await client.query(
        `INSERT INTO product_ingredients
           (product_id, ingredient_id, ingredient_display_name, inci_order_rank, is_highlighted_in_claims, match_status)
         VALUES ($1,$2,$3,$4,$5,'manual')`,
        [productId, ingId, displayName, i + 1, highlight],
      );
    }

    // 5. product_images (skip if no URL resolved)
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
    if (e instanceof PipelineError) throw e;
    throw new PipelineError('Stage 3', `INSERT başarısız, ROLLBACK yapıldı: ${e?.message ?? e}`);
  }

  // Post-commit assertions — ensures all rows landed.
  await postCommitAssertions(ctx);
}

async function postCommitAssertions(ctx: PipelineContext): Promise<void> {
  const { client, logger } = ctx;
  const pid = ctx.product_id!;
  const sdCount = await client.query(`SELECT 1 FROM supplement_details WHERE product_id=$1`, [pid]);
  const siCount = await client.query(`SELECT COUNT(*)::int AS c FROM supplement_ingredients WHERE product_id=$1`, [pid]);
  const alCount = await client.query(`SELECT COUNT(*)::int AS c FROM affiliate_links WHERE product_id=$1`, [pid]);
  if (sdCount.rowCount === 0) {
    throw new PipelineError('Stage 3 post-commit', 'supplement_details satırı bulunamadı.');
  }
  const expectedIngs = ctx.doc.product.ingredients.length;
  if (siCount.rows[0].c !== expectedIngs) {
    throw new PipelineError(
      'Stage 3 post-commit',
      `supplement_ingredients satır sayısı ${siCount.rows[0].c}, beklenen ${expectedIngs}.`,
    );
  }
  if (alCount.rows[0].c < 1) {
    throw new PipelineError('Stage 3 post-commit', 'affiliate_links satırı bulunamadı.');
  }
  logger.ok(3, `Post-commit assertion OK (sd=1, si=${siCount.rows[0].c}, al=${alCount.rows[0].c})`);
}
