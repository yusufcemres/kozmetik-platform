import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// 1. Parfum/Fragrance ingredient flag durumu
const r1 = await c.query(`SELECT ingredient_slug, inci_name, fragrance_flag, allergen_flag FROM ingredients WHERE inci_name ILIKE 'parfum%' OR inci_name ILIKE 'fragrance%' OR ingredient_slug LIKE '%parfum%' OR ingredient_slug LIKE '%fragrance%' LIMIT 10`);
console.log('## Parfum/Fragrance ingredients in DB:');
for (const r of r1.rows) console.log(`  ${r.ingredient_slug} | ${r.inci_name} | fragrance:${r.fragrance_flag} | allergen:${r.allergen_flag}`);

// 2. Total flag stats
const r2 = await c.query(`SELECT
  COUNT(*) FILTER (WHERE fragrance_flag = true) as fragrance_count,
  COUNT(*) FILTER (WHERE allergen_flag = true) as allergen_count,
  COUNT(*) as total
FROM ingredients`);
console.log(`\n## Toplam ingredient: ${r2.rows[0].total}`);
console.log(`  fragrance_flag = true: ${r2.rows[0].fragrance_count}`);
console.log(`  allergen_flag = true: ${r2.rows[0].allergen_count}`);

// 3. EU 26 alerjen listesi (linalool, limonene, citronellol vb.) — bunlar allergen_flag=true mu?
const eu26 = ['linalool','limonene','citronellol','geraniol','citral','eugenol','farnesol','benzyl-alcohol','benzyl-benzoate','benzyl-cinnamate','benzyl-salicylate','butylphenyl-methylpropional','cinnamal','cinnamyl-alcohol','coumarin','hexyl-cinnamal','hydroxycitronellal','isoeugenol','methyl-2-octynoate','alpha-isomethyl-ionone','amyl-cinnamal','amylcinnamyl-alcohol','anisyl-alcohol','tree-moss-extract','oak-moss-extract'];
const r3 = await c.query(`SELECT ingredient_slug, allergen_flag FROM ingredients WHERE ingredient_slug = ANY($1::text[])`, [eu26]);
console.log(`\n## EU-26 alerjen DB durumu (${r3.rows.length} bulundu):`);
let flagged = 0, unflagged = 0;
for (const r of r3.rows) {
  if (r.allergen_flag) flagged++; else unflagged++;
}
console.log(`  allergen_flag=true: ${flagged} | =false/null: ${unflagged}`);
if (unflagged > 0) {
  console.log('  Eksik flag:');
  for (const r of r3.rows.filter(x => !x.allergen_flag)) console.log(`    ${r.ingredient_slug}`);
}

// 4. Sample broken case — bir kozmetik ürünün parfum içeriğinin flag durumu
const r4 = await c.query(`
  SELECT pi.product_id, p.product_name, pi.ingredient_display_name, i.fragrance_flag, i.allergen_flag
  FROM product_ingredients pi
  JOIN products p ON p.product_id = pi.product_id
  JOIN ingredients i ON i.ingredient_id = pi.ingredient_id
  WHERE pi.ingredient_display_name ILIKE 'parfum%' AND p.domain_type='cosmetic' AND p.status='published'
  LIMIT 5
`);
console.log(`\n## Parfum bulundu örnek ürünler (DB join):`);
for (const r of r4.rows) console.log(`  ${r.product_name.slice(0,40)} → ${r.ingredient_display_name} | fragrance:${r.fragrance_flag} | allergen:${r.allergen_flag}`);

await c.end();
