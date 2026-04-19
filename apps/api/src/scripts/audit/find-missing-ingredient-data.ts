/**
 * Audit — ingredient data quality.
 *
 * Lists ingredients that trip recurring bugs:
 *  - NULL common_name           (UI gösterir inci_name)
 *  - EN function_summary        (heuristic: no TR-specific chars + >80 chars)
 *  - NULL food_sources          (only for nutrient groups)
 *  - NULL elemental_ratio       (chelated/compound form detected)
 *  - NULL evidence_grade        (scoring fallback 50)
 *
 * Only scans ingredients linked to at least one supplement product — global
 * catalog would drown the signal.
 *
 * Usage: ts-node find-missing-ingredient-data.ts [--json]
 */
import { newClient } from '../onboarding/db';

const CHELATED_RE = /(bisglycinate|gluconate|picolinate|citrate|malate|carbonate|oxide|ascorbate|orotate|fumarate|sulfate|chloride|aspartate|lactate)/i;
const TR_RE = /[çğıöşüÇĞİÖŞÜ]/;
const NUTRIENT_GROUPS = new Set(['vitamin', 'mineral', 'amino-acid', 'fatty-acid']);

type AuditRow = {
  ingredient_id: number;
  ingredient_slug: string;
  inci_name: string;
  common_name: string | null;
  function_summary: string | null;
  evidence_grade: string | null;
  elemental_ratio: number | null;
  food_sources: unknown;
  ingredient_group: string | null;
  product_count: number;
};

async function main(): Promise<void> {
  const jsonOut = process.argv.includes('--json');
  const client = newClient();
  await client.connect();
  try {
    const res = await client.query<AuditRow>(
      `SELECT
          i.ingredient_id, i.ingredient_slug, i.inci_name, i.common_name,
          i.function_summary, i.evidence_grade, i.elemental_ratio, i.food_sources,
          i.ingredient_group,
          COUNT(DISTINCT si.product_id)::int AS product_count
         FROM ingredients i
    LEFT JOIN supplement_ingredients si ON si.ingredient_id = i.ingredient_id
        WHERE i.domain_type = 'supplement'
           OR si.product_id IS NOT NULL
        GROUP BY i.ingredient_id
       HAVING COUNT(DISTINCT si.product_id) > 0
        ORDER BY product_count DESC, i.ingredient_slug`,
    );

    const issues: Array<{ slug: string; problems: string[]; product_count: number }> = [];

    for (const r of res.rows) {
      const probs: string[] = [];
      if (!r.common_name || !r.common_name.trim()) {
        probs.push('NULL common_name');
      }
      if (!r.function_summary || !r.function_summary.trim()) {
        probs.push('NULL function_summary');
      } else if (r.function_summary.length > 80 && !TR_RE.test(r.function_summary)) {
        probs.push('function_summary İngilizce görünüyor');
      }
      if (!r.evidence_grade) probs.push('NULL evidence_grade');
      const hay = `${r.inci_name ?? ''} ${r.ingredient_slug ?? ''}`;
      if (CHELATED_RE.test(hay) && r.elemental_ratio == null) {
        probs.push('NULL elemental_ratio (chelated)');
      }
      if (r.ingredient_group && NUTRIENT_GROUPS.has(r.ingredient_group)) {
        const fs = r.food_sources as unknown[] | null;
        if (!Array.isArray(fs) || fs.length === 0) {
          probs.push('NULL food_sources (nutrient)');
        }
      }
      if (probs.length > 0) issues.push({ slug: r.ingredient_slug, problems: probs, product_count: r.product_count });
    }

    if (jsonOut) {
      console.log(JSON.stringify(issues, null, 2));
      return;
    }

    console.log(`\n─── Audit: supplement catalog içinde kullanılan ingredient eksikleri ───`);
    console.log(`Toplam kullanılan ingredient: ${res.rowCount}, sorunlu: ${issues.length}`);
    console.log('');
    if (issues.length === 0) {
      console.log('✅ Hiç eksik yok, herşey dolu.');
      return;
    }
    for (const i of issues) {
      console.log(`  [${i.product_count} ürün] ${i.slug}`);
      for (const p of i.problems) console.log(`    - ${p}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e?.stack ?? e?.message ?? e);
  process.exit(1);
});
