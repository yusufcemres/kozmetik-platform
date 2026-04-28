/**
 * Generic batch enricher — JSON manifest'ten ürün listesini okur, transaction'la zenginleştirir.
 *
 * Manifest format (data/enrichment-manifest.json):
 * {
 *   "products": [
 *     {
 *       "product_id": 2660,
 *       "product_name": "...",
 *       "short_description": "...",
 *       "net_content_value": 250,
 *       "net_content_unit": "ml",
 *       "target_area": "face",
 *       "product_type_label": "...",
 *       "inci": [{"slug": "aqua", "display": "Aqua", "band": "very_high", "highlighted": false}, ...],
 *       "usage": "...",
 *       "warning": "...",
 *       "claims": ["...", "..."],
 *       "image_url": "https://...",
 *       "source_url": "https://..."  // raporlama için
 *     }
 *   ]
 * }
 *
 * Kullanım:
 *   node enrich-products-batch.mjs --manifest=enrichment-manifest.json           # dry-run
 *   node enrich-products-batch.mjs --manifest=enrichment-manifest.json --apply   # uygula
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

async function enrichOne(client, p, ingMapByName) {
  // Lookup ingredient_ids by slug
  const slugs = p.inci.map((i) => i.slug).filter(Boolean);
  let ingMap = new Map();
  if (slugs.length) {
    const res = await client.query(
      `SELECT ingredient_id, ingredient_slug FROM ingredients WHERE ingredient_slug = ANY($1::text[])`,
      [slugs],
    );
    ingMap = new Map(res.rows.map((r) => [r.ingredient_slug, r.ingredient_id]));
  }

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
      p.short_description,
      p.net_content_value,
      p.net_content_unit,
      p.target_area || null,
      p.product_type_label || null,
      p.product_id,
    ],
  );

  // 2. DELETE eski INCI + need_scores (cascade önce)
  await client.query(`DELETE FROM product_need_scores WHERE product_id = $1`, [p.product_id]);
  await client.query(`DELETE FROM product_ingredients WHERE product_id = $1`, [p.product_id]);

  // 3. INSERT yeni INCI
  let order = 0;
  let matchedCount = 0;
  for (const ing of p.inci) {
    order++;
    const ingId = ing.slug ? ingMap.get(ing.slug) : null;
    if (ingId) matchedCount++;
    await client.query(
      `INSERT INTO product_ingredients (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims, match_status, match_confidence, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
      [
        p.product_id,
        ingId,
        ing.display,
        order,
        ing.band || 'low',
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
      p.product_id,
      p.usage || null,
      p.warning || null,
      JSON.stringify(p.claims || []),
      p.net_content_value && p.net_content_unit ? `${p.net_content_value} ${p.net_content_unit}` : null,
    ],
  );

  // 5. product_images (upsert: silmeden önce primary'i koru)
  if (p.image_url) {
    await client.query(`DELETE FROM product_images WHERE product_id = $1`, [p.product_id]);
    await client.query(
      `INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text, created_at)
       VALUES ($1, $2, 'product', 0, $3, NOW())`,
      [p.product_id, p.image_url, p.product_name || ''],
    );
  }

  // 6. Recompute need_scores — mevcut cosmetic algoritması (tüm effect_type'lar, ağırlıklı)
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
     JOIN products pp ON pp.product_id = pi.product_id
     JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
     JOIN needs n ON n.need_id = inm.need_id
     WHERE pi.product_id = $1
       AND n.domain_type IN ('cosmetic','both')
     GROUP BY pi.product_id, inm.need_id
     HAVING AVG(inm.relevance_score) >= 25`,
    [p.product_id],
  );

  // 7. top_need refresh
  await client.query(
    `UPDATE products p SET top_need_name = sub.need_name, top_need_score = sub.compatibility_score
     FROM (SELECT DISTINCT ON (ns.product_id) ns.product_id, n.need_name, ns.compatibility_score
           FROM product_need_scores ns JOIN needs n ON n.need_id = ns.need_id
           WHERE ns.product_id = $1
           ORDER BY ns.product_id, ns.compatibility_score DESC) sub
     WHERE p.product_id = sub.product_id`,
    [p.product_id],
  );

  return { matched: matchedCount, total: p.inci.length };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const manifestArg = getArg('manifest');
  if (!manifestArg) {
    console.error('--manifest=path/to/manifest.json gerekli');
    process.exit(1);
  }
  const manifestPath = isAbsolute(manifestArg)
    ? manifestArg
    : resolve(__dirname, manifestArg);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  if (!Array.isArray(manifest.products) || !manifest.products.length) {
    console.error('Manifest boş.');
    process.exit(1);
  }

  console.log(`Manifest: ${manifestPath}`);
  console.log(`Products: ${manifest.products.length}`);
  console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);

  if (!apply) {
    for (const p of manifest.products) {
      console.log(`  - [${p.product_id}] ${p.product_name} → ${p.inci.length} INCI, ${p.claims?.length || 0} claims, image: ${p.image_url ? 'yes' : 'no'}`);
    }
    console.log('\n--apply ekleyerek çalıştır.');
    return;
  }

  const url = process.env.DATABASE_URL;
  const client = new Client({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  let okCount = 0;
  let failCount = 0;
  const failures = [];

  try {
    for (const p of manifest.products) {
      try {
        await client.query('BEGIN');
        const r = await enrichOne(client, p);
        await client.query('COMMIT');
        okCount++;
        console.log(`  OK [${p.product_id}] ${p.product_name} (${r.matched}/${r.total} INCI matched)`);
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        failCount++;
        failures.push({ product_id: p.product_id, error: err.message });
        console.error(`  FAIL [${p.product_id}] ${p.product_name}: ${err.message}`);
      }
    }
  } finally {
    await client.end();
  }

  console.log(`\nDone: ${okCount} OK, ${failCount} FAIL`);
  if (failures.length) {
    console.log('Failures:');
    for (const f of failures) console.log(`  - ${f.product_id}: ${f.error}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
