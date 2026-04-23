/**
 * Hızlı sorgu — supplement için DB'de hazır ingredient slug'larını listele.
 * Claude prompt'una verilecek "ready list".
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/list-ready-ingredients.ts
 */
import { Client } from 'pg';

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const rows = await client.query(
    `SELECT DISTINCT i.ingredient_slug,
            i.inci_name,
            i.common_name,
            i.domain_type,
            i.evidence_grade,
            i.effective_dose_min,
            i.effective_dose_max,
            i.effective_dose_unit,
            i.ul_dose,
            i.function_summary IS NOT NULL AS has_function,
            EXISTS (
              SELECT 1 FROM product_ingredients pi
              JOIN products p ON p.product_id = pi.product_id
              WHERE pi.ingredient_id = i.ingredient_id AND p.domain_type = 'supplement'
            ) AS used_in_supplement
     FROM ingredients i
     WHERE
       i.domain_type IN ('supplement','both')
       OR i.evidence_grade IS NOT NULL
       OR i.effective_dose_max IS NOT NULL
     ORDER BY i.ingredient_slug`,
  );

  // Ingredient is supplement-usable if:
  //   (a) already used by a supplement product, OR
  //   (b) explicitly in domain 'supplement'/'both' with a function summary, OR
  //   (c) common vitamin/mineral/amino-acid slug usable as oral supplement
  //       (dual-use: cosmetic ingredients like vitamin-b6, zinc, vitamin-c are
  //        also valid supplement ingredients regardless of domain_type flag)
  const vitaminMineralPattern = /^(vitamin-|b-?complex|biotin|folate|folic|niacin|pantothen|riboflavin|thiamin|cobalamin|choline|inositol|magnesium|calcium|zinc|iron|selenium|iodine|copper|manganese|chromium|potassium|phosphorus|boron|molybdenum|cholecalciferol|retinol|ascorb|tocopherol|phylloquinone|menaquinone|alpha-lipoic|coenzyme|taurine|glycine|lysine|arginine|carnitine|tyrosine|tryptophan|5-htp|glutamine|methionine|cysteine|theanine|betaine|inulin)/;
  const ready = rows.rows.filter((r: any) => {
    if (r.used_in_supplement) return true;
    if ((r.domain_type === 'supplement' || r.domain_type === 'both') && r.has_function) return true;
    // Core vitamins/minerals are supplement-usable regardless of has_function flag
    // (onboard pipeline looks up by slug; function_summary only validated for NEW ingredients).
    if (vitaminMineralPattern.test(r.ingredient_slug)) return true;
    return false;
  });

  console.log(JSON.stringify({
    total_candidate_rows: rows.rowCount,
    ready_count: ready.length,
    ready_slugs: ready.map((r: any) => r.ingredient_slug),
    ingredients: ready.map((r: any) => ({
      slug: r.ingredient_slug,
      common: r.common_name || r.inci_name,
      domain: r.domain_type,
      grade: r.evidence_grade,
      dose_min: r.effective_dose_min,
      dose_max: r.effective_dose_max,
      dose_unit: r.effective_dose_unit,
      ul: r.ul_dose,
      used: r.used_in_supplement,
    })),
  }, null, 2));

  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
