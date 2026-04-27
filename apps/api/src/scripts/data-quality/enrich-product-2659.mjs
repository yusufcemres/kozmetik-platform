/**
 * The Ordinary Niacinamide 10% + Zinc 1% Serum 30 ml — tam veri zenginleştirme demosu.
 * Kaynak: theordinary.com resmi sayfa (WebFetch ile çekildi).
 *
 * Pipeline:
 *  1) DELETE eski product_ingredients (4 → 11 yeni)
 *  2) INSERT 11 INCI tam liste
 *  3) UPDATE products: short_description, net_content, target_area, status='published'
 *  4) INSERT product_labels (usage, warning, claims)
 *  5) INSERT product_images (foto URL)
 *  6) Recompute need_scores
 *
 * Patron review için demo. Onay sonrası 39 ürün için aynı pattern.
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const PRODUCT_ID = 2659; // The Ordinary Niacinamide 10% + Zinc 1% Serum

// Resmi siteden çekilen tam veri
const DATA = {
  product_name: 'The Ordinary Niacinamide 10% + Zinc 1% Serum 30 ml',
  short_description: 'Yağlı ve gözenek görünümü olan ciltler için niasinamid 10% + çinko PCA 1% içeren su bazlı serum. Cildi pürüzsüzleştirir, parlaklığı artırır, sebum dengeleyicidir.',
  net_content_value: 30,
  net_content_unit: 'ml',
  target_area: 'face',
  product_type_label: 'Yüz Serumu',
  inci: [
    { slug: 'aqua', display: 'Aqua (Water)', band: 'very_high' },
    { slug: 'niacinamide', display: 'Niacinamide', band: 'high', highlighted: true },
    { slug: 'pentylene-glycol', display: 'Pentylene Glycol', band: 'high' },
    { slug: 'zinc-pca', display: 'Zinc PCA', band: 'medium', highlighted: true },
    { slug: 'dimethyl-isosorbide', display: 'Dimethyl Isosorbide', band: 'medium' },
    { slug: null, display: 'Tamarindus Indica Seed Gum', band: 'low' },
    { slug: 'xanthan-gum', display: 'Xanthan Gum', band: 'low' },
    { slug: 'isoceteth-20', display: 'Isoceteth-20', band: 'low' },
    { slug: 'ethoxydiglycol', display: 'Ethoxydiglycol', band: 'low' },
    { slug: 'phenoxyethanol', display: 'Phenoxyethanol', band: 'trace' },
    { slug: 'chlorphenesin', display: 'Chlorphenesin', band: 'trace' },
  ],
  usage: 'Sabah ve akşam yüze birkaç damla uygulayın. Sadece sağlam cilt üzerinde kullanın. İlk kullanım öncesi patch testi önerilir.',
  warning: 'Tahriş olursa durulayın ve kullanımı bırakın. Direkt C vitamini ile aynı zamanda kullanmayın. Çocukların ulaşamayacağı yerde saklayın.',
  claims: [
    'Bestseller',
    'SheerLuxe Beauty Awards 2023 - Best Serum',
    'Tüm cilt tipleri için uygun',
    'Vegan',
    'Cruelty-Free',
    'Alkol içermez',
    'Yağ içermez',
    'Silikon içermez',
    'pH: 5.00-6.50',
  ],
  image_url: 'https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master/default/dwce8a7cdf/Images/products/The%20Ordinary/rdn-niacinamide-10pct-zinc-1pct-30ml.png',
};

async function main() {
  const apply = process.argv.includes('--apply');
  const url = process.env.DATABASE_URL;
  const client = new Client({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    // Lookup ingredient_ids
    const slugs = DATA.inci.map((i) => i.slug).filter(Boolean);
    const ingRes = await client.query(
      `SELECT ingredient_id, ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`,
      [slugs],
    );
    const ingMap = new Map(ingRes.rows.map((r) => [r.ingredient_slug, r.ingredient_id]));
    console.log(`Ingredients matched: ${ingMap.size}/${slugs.length}`);

    if (!apply) {
      console.log('\n[DRY-RUN]');
      console.log(`Product ID: ${PRODUCT_ID}`);
      console.log(`INCI: ${DATA.inci.length} items, ${ingMap.size} matched in DB`);
      console.log(`Image URL: ${DATA.image_url}`);
      console.log(`Net: ${DATA.net_content_value} ${DATA.net_content_unit}`);
      console.log('Re-run with --apply');
      return;
    }

    await client.query('BEGIN');

    // 1. UPDATE products
    await client.query(
      `UPDATE products
       SET short_description = $1,
           net_content_value = $2,
           net_content_unit = $3,
           target_area = $4,
           product_type_label = $5,
           status = 'published',
           updated_at = NOW()
       WHERE product_id = $6`,
      [
        DATA.short_description,
        DATA.net_content_value,
        DATA.net_content_unit,
        DATA.target_area,
        DATA.product_type_label,
        PRODUCT_ID,
      ],
    );

    // 2. DELETE eski product_ingredients (need_scores cascade için sıralı)
    await client.query(`DELETE FROM product_need_scores WHERE product_id = $1`, [PRODUCT_ID]);
    await client.query(`DELETE FROM product_ingredients WHERE product_id = $1`, [PRODUCT_ID]);

    // 3. INSERT 11 yeni INCI
    let order = 0;
    for (const ing of DATA.inci) {
      order++;
      const ingId = ing.slug ? ingMap.get(ing.slug) : null;
      await client.query(
        `INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims, match_status, match_confidence, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          PRODUCT_ID,
          ingId,
          ing.display,
          order,
          ing.band,
          ing.band === 'trace' || ing.band === 'low',
          !!ing.highlighted,
          ingId ? 'matched' : 'unmatched',
          ingId ? 0.95 : 0.5,
        ],
      );
    }

    // 4. UPSERT product_labels
    await client.query(
      `INSERT INTO product_labels (product_id, usage_instructions, warning_text, claim_texts_json, net_content_display, created_at, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, NOW(), NOW())
       ON CONFLICT (product_id) DO UPDATE
       SET usage_instructions = EXCLUDED.usage_instructions,
           warning_text = EXCLUDED.warning_text,
           claim_texts_json = EXCLUDED.claim_texts_json,
           net_content_display = EXCLUDED.net_content_display,
           updated_at = NOW()`,
      [
        PRODUCT_ID,
        DATA.usage,
        DATA.warning,
        JSON.stringify(DATA.claims),
        `${DATA.net_content_value} ${DATA.net_content_unit}`,
      ],
    );

    // 5. UPSERT product_images
    await client.query(`DELETE FROM product_images WHERE product_id = $1`, [PRODUCT_ID]);
    await client.query(
      `INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text, created_at)
       VALUES ($1, $2, 'product', 0, $3, NOW())`,
      [PRODUCT_ID, DATA.image_url, DATA.product_name],
    );

    // 6. Recompute need_scores
    await client.query(
      `INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, calculated_at)
       SELECT pi.product_id, inm.need_id,
              LEAST(100, ROUND(AVG(inm.relevance_score)::numeric, 2)),
              CASE WHEN COUNT(*) >= 3 THEN 'high' WHEN COUNT(*) >= 1 THEN 'medium' ELSE 'low' END,
              NOW()
       FROM product_ingredients pi
       JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
       WHERE pi.product_id = $1
         AND inm.effect_type IN ('direct_support', 'complementary')
       GROUP BY pi.product_id, inm.need_id
       HAVING AVG(inm.relevance_score) >= 30`,
      [PRODUCT_ID],
    );

    // 7. Refresh top_need
    await client.query(
      `UPDATE products p SET top_need_name = sub.need_name, top_need_score = sub.compatibility_score
       FROM (SELECT DISTINCT ON (ns.product_id) ns.product_id, n.need_name, ns.compatibility_score
             FROM product_need_scores ns JOIN needs n ON n.need_id = ns.need_id
             WHERE ns.product_id = $1
             ORDER BY ns.product_id, ns.compatibility_score DESC) sub
       WHERE p.product_id = sub.product_id`,
      [PRODUCT_ID],
    );

    await client.query('COMMIT');
    console.log('\nOK: Product 2659 fully enriched');
    console.log(`  - INCI: ${DATA.inci.length} items (was 4)`);
    console.log(`  - Image: ${DATA.image_url.slice(0, 60)}...`);
    console.log(`  - Status: published`);
    console.log(`  - Test URL: https://kozmetik-platform.vercel.app/urunler/the-ordinary-niacinamide-10-zinc-1-serum-30-ml`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('FAILED:', err);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
