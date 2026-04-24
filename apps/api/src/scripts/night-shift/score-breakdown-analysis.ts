/**
 * Analyze score breakdowns to find improvement leverage points.
 * Usage: ./run-prod.sh src/scripts/night-shift/score-breakdown-analysis.ts
 */
import { Client } from 'pg';

async function main() {
  const c = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const since = '2026-04-22 18:00';

  // Component averages
  const comp = await c.query(
    `SELECT
       AVG((ps.breakdown->>'form_quality')::numeric)::numeric(5,1)         AS avg_form,
       AVG((ps.breakdown->>'dose_efficacy')::numeric)::numeric(5,1)        AS avg_dose,
       AVG((ps.breakdown->>'evidence_grade')::numeric)::numeric(5,1)       AS avg_evid,
       AVG((ps.breakdown->>'third_party_testing')::numeric)::numeric(5,1)  AS avg_3rd,
       AVG((ps.breakdown->>'interaction_safety')::numeric)::numeric(5,1)   AS avg_intr,
       AVG((ps.breakdown->>'transparency_and_tier')::numeric)::numeric(5,1) AS avg_trans
     FROM product_scores ps JOIN products p USING(product_id)
     WHERE p.domain_type='supplement' AND p.created_at >= $1`,
    [since],
  );
  console.log('\n=== KOMPONENT ORTALAMALARI (tüm 91 ürün) ===');
  console.log(comp.rows[0]);

  // Bottom 10 drill-down
  const bottom = await c.query(
    `SELECT p.product_id, p.product_name, p.status, ps.overall_score AS score,
            ps.breakdown, ps.floor_cap_applied
     FROM product_scores ps JOIN products p USING(product_id)
     WHERE p.domain_type='supplement' AND p.created_at >= $1
     ORDER BY ps.overall_score ASC LIMIT 10`,
    [since],
  );
  console.log('\n=== EN DÜŞÜK 10 — BREAKDOWN ===');
  for (const r of bottom.rows) {
    const b = r.breakdown;
    console.log(
      `[${r.score}] ${r.product_name.slice(0, 55).padEnd(55)} ` +
      `form=${b.form_quality} dose=${b.dose_efficacy} evid=${b.evidence_grade} ` +
      `3rd=${b.third_party_testing} intr=${b.interaction_safety} trans=${b.transparency_and_tier} ` +
      `cap=${r.floor_cap_applied || '-'}`,
    );
  }

  // Certification field snapshot
  const certs = await c.query(
    `SELECT sd.certification, COUNT(*)::int
     FROM supplement_details sd JOIN products p USING(product_id)
     WHERE p.domain_type='supplement' AND p.created_at >= $1
     GROUP BY sd.certification ORDER BY 2 DESC`,
    [since],
  );
  console.log('\n=== SERTIFIKA DAĞILIMI ===');
  for (const r of certs.rows) console.log(`  ${(r.certification || '<null>').padEnd(40)} ${r.count}`);

  // Ingredients missing critical scoring fields (evidence_grade / bioavailability / effective_dose)
  const ingGaps = await c.query(
    `SELECT i.ingredient_slug, i.common_name,
            i.evidence_grade,
            i.bioavailability_score,
            i.effective_dose_min, i.effective_dose_max,
            COUNT(DISTINCT pi.product_id)::int AS used_in_products
     FROM supplement_ingredients pi
     JOIN ingredients i USING(ingredient_id)
     JOIN products p USING(product_id)
     WHERE p.domain_type='supplement' AND p.created_at >= $1
     GROUP BY i.ingredient_slug, i.common_name, i.evidence_grade, i.bioavailability_score,
              i.effective_dose_min, i.effective_dose_max
     HAVING i.evidence_grade IS NULL OR i.bioavailability_score IS NULL
        OR i.effective_dose_min IS NULL OR i.effective_dose_max IS NULL
     ORDER BY used_in_products DESC LIMIT 30`,
    [since],
  );
  console.log('\n=== EN ÇOK KULLANILAN BUT EKSIK-SKOR-FIELD INGREDIENT ===');
  console.log('slug                              | evid | bio  | dose_min | dose_max | #ürün');
  for (const r of ingGaps.rows) {
    console.log(
      `${(r.ingredient_slug || '').slice(0, 33).padEnd(33)} | ` +
      `${(r.evidence_grade || '--').padEnd(4)} | ${String(r.bioavailability_score || '--').padEnd(4)} | ` +
      `${String(r.effective_dose_min || '--').padEnd(8)} | ${String(r.effective_dose_max || '--').padEnd(8)} | ${r.used_in_products}`,
    );
  }

  await c.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
