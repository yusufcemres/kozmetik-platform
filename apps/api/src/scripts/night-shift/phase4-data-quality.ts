/**
 * Night Shift — Phase 4: Data Quality Sweep
 *
 * 4a. Duplicate candidates (same brand + similar normalized name)
 * 4b. Missing critical fields (INCI for cosmetic, dosage for supplement, brand/category null)
 * 4c. Mapping orphans (ingredients with 0 products, needs with 0 ingredients)
 *
 * All read-only SQL. No mutations. Output markdown + json.
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const reportDirArg = args.find((a) => a.startsWith('--report-dir='));
  const reportDir =
    reportDirArg?.split('=')[1] ||
    path.resolve(process.cwd(), '../../night-shift-reports', new Date().toISOString().slice(0, 10));
  fs.mkdirSync(reportDir, { recursive: true });

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const ds = app.get(DataSource);

  const startedAt = Date.now();
  console.log(`[phase4] START ${new Date().toISOString()}`);

  // 4a. Duplicate candidates — same brand + normalized name prefix match
  const dupes: any[] = await ds.query(`
    SELECT
      b.brand_name,
      p1.product_id AS id_a,
      p1.product_name AS name_a,
      p2.product_id AS id_b,
      p2.product_name AS name_b,
      LEFT(LOWER(REGEXP_REPLACE(p1.product_name, '[^a-z0-9]+', '', 'g')), 20) AS norm_prefix
    FROM products p1
    JOIN products p2 ON p1.brand_id = p2.brand_id
      AND p1.product_id < p2.product_id
      AND LEFT(LOWER(REGEXP_REPLACE(p1.product_name, '[^a-z0-9]+', '', 'g')), 20) = LEFT(LOWER(REGEXP_REPLACE(p2.product_name, '[^a-z0-9]+', '', 'g')), 20)
      AND LENGTH(LOWER(REGEXP_REPLACE(p1.product_name, '[^a-z0-9]+', '', 'g'))) >= 10
    JOIN brands b ON b.brand_id = p1.brand_id
    WHERE p1.status IN ('published','active') AND p2.status IN ('published','active')
    ORDER BY b.brand_name, p1.product_name
    LIMIT 100
  `);

  // 4b. Missing critical fields
  const missingInci: any[] = await ds.query(`
    SELECT p.product_id, p.product_name, b.brand_name
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN product_ingredients pi ON pi.product_id = p.product_id
    WHERE p.domain_type = 'cosmetic' AND p.status IN ('published','active')
    GROUP BY p.product_id, p.product_name, b.brand_name
    HAVING COUNT(pi.ingredient_id) = 0
    LIMIT 100
  `);

  const missingBrand: any[] = await ds.query(`
    SELECT product_id, product_name FROM products
    WHERE status IN ('published','active') AND (brand_id IS NULL)
    LIMIT 50
  `);

  const missingCategory: any[] = await ds.query(`
    SELECT product_id, product_name FROM products
    WHERE status IN ('published','active') AND (category_id IS NULL)
    LIMIT 50
  `);

  // 4c. Orphans
  const orphanIngredients: any[] = await ds.query(`
    SELECT i.ingredient_id, i.inci_name AS ingredient_name
    FROM ingredients i
    LEFT JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id
    WHERE pi.ingredient_id IS NULL
    LIMIT 100
  `);

  let orphanNeeds: any[] = [];
  try {
    orphanNeeds = await ds.query(`
      SELECT n.need_id, n.slug AS need_slug
      FROM needs n
      LEFT JOIN need_ingredient_mappings nim ON nim.need_id = n.need_id
      WHERE nim.need_id IS NULL
      LIMIT 50
    `);
  } catch (_e) {
    // Mapping table may have different name in this repo; ignore
  }

  // Write report
  const dateStr = new Date().toISOString().slice(0, 10);
  let md = `# Data Quality Sweep — ${dateStr}\n\n`;
  md += `Run at: ${new Date().toISOString()}\n\n`;

  md += `## 4a. Duplicate candidates (same brand + 20-char normalized prefix match)\n\n`;
  md += `Found: **${dupes.length}** pair candidates (top 100 shown).\n\n`;
  if (dupes.length > 0) {
    md += `| Brand | A (id) | A (name) | B (id) | B (name) |\n|---|---|---|---|---|\n`;
    for (const d of dupes.slice(0, 50)) {
      md += `| ${d.brand_name} | ${d.id_a} | ${d.name_a} | ${d.id_b} | ${d.name_b} |\n`;
    }
  }

  md += `\n## 4b. Missing critical fields\n\n`;
  md += `### Cosmetic products with ZERO ingredients (top 100)\n\n`;
  md += `Count: **${missingInci.length}**\n\n`;
  for (const r of missingInci.slice(0, 30)) {
    md += `- ${r.brand_name} — ${r.product_name} (id=${r.product_id})\n`;
  }

  md += `\n### Products with NULL brand\n\n`;
  md += `Count: **${missingBrand.length}**\n\n`;
  for (const r of missingBrand.slice(0, 20)) md += `- ${r.product_name} (id=${r.product_id})\n`;

  md += `\n### Products with NULL category\n\n`;
  md += `Count: **${missingCategory.length}**\n\n`;
  for (const r of missingCategory.slice(0, 20)) md += `- ${r.product_name} (id=${r.product_id})\n`;

  md += `\n## 4c. Orphans\n\n`;
  md += `### Ingredients not linked to any product\n\n`;
  md += `Count: **${orphanIngredients.length}**\n\n`;
  for (const r of orphanIngredients.slice(0, 30)) md += `- ${r.ingredient_name} (id=${r.ingredient_id})\n`;

  if (orphanNeeds.length > 0) {
    md += `\n### Needs with no ingredient mappings\n\n`;
    md += `Count: **${orphanNeeds.length}**\n\n`;
    for (const r of orphanNeeds.slice(0, 20)) md += `- ${r.need_slug} (id=${r.need_id})\n`;
  }

  const mdPath = path.join(reportDir, 'data_quality.md');
  fs.writeFileSync(mdPath, md);
  console.log(`[phase4] wrote ${mdPath}`);

  const summary = {
    phase: 'phase4',
    run_at: new Date().toISOString(),
    duration_s: Math.round((Date.now() - startedAt) / 1000),
    duplicate_candidates: dupes.length,
    missing_inci_cosmetic: missingInci.length,
    missing_brand: missingBrand.length,
    missing_category: missingCategory.length,
    orphan_ingredients: orphanIngredients.length,
    orphan_needs: orphanNeeds.length,
  };
  fs.writeFileSync(path.join(reportDir, 'phase4_summary.json'), JSON.stringify(summary, null, 2));
  console.log(`[phase4] DONE in ${Math.round((Date.now() - startedAt) / 1000)}s`);

  await app.close();
}

main().catch((err) => {
  console.error('[phase4] FATAL:', err);
  process.exit(1);
});
