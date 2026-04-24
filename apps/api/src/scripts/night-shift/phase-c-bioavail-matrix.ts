/**
 * Faz C — Bioavailability_score matrisi.
 *
 * Her ingredient için form-bazlı bioavailability tahmini (literatür-bazlı estimate).
 * Kesin değerler değil, skor modeli için makul defaults. Sonra form-specific
 * variant ingredient'ler (magnesium-bisglycinate, methylcobalamin vs) ayrı
 * populate edilir.
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/phase-c-bioavail-matrix.ts
 */
import { Client } from 'pg';

const BIOAVAIL: Record<string, number> = {
  // Vitamins
  'cholecalciferol': 75,
  'ergocalciferol': 40,
  'vitamin-d3': 75,
  'vitamin-c': 60,
  'ascorbic-acid': 60,
  'vitamin-b6': 60,
  'methylfolate': 95,
  'folic-acid': 60,
  'vitamin-b12': 60,
  'methylcobalamin': 90,
  'cyanocobalamin': 55,
  'vitamin-k2': 80,
  'menaquinone-7': 85,
  'menaquinone-4': 70,
  'biotin': 90,
  'thiamine': 70,
  'riboflavin': 70,
  'niacin': 75,
  'pantothenic-acid': 80,
  'iodine': 95,
  'vitamin-e': 55,
  'tocopherol': 55,
  'mixed-tocopherols': 70,
  'vitamin-a': 75,
  'beta-carotene': 50,
  'retinol': 85,
  'retinyl-palmitate': 70,

  // Minerals
  'magnesium': 55,
  'magnesium-oxide': 30,
  'magnesium-citrate': 60,
  'magnesium-bisglycinate': 90,
  'magnesium-glycinate': 85,
  'magnesium-malate': 70,
  'magnesium-threonate': 85,
  'zinc': 55,
  'zinc-oxide': 35,
  'zinc-sulfate': 45,
  'zinc-citrate': 65,
  'zinc-picolinate': 80,
  'zinc-bisglycinate': 85,
  'iron': 40,
  'ferrous-sulfate': 30,
  'ferrous-fumarate': 35,
  'ferrous-bisglycinate': 75,
  'iron-pyrophosphate': 60,
  'selenium': 75,
  'selenomethionine': 85,
  'chromium-picolinate': 75,
  'chromium-chloride': 40,
  'calcium': 50,
  'calcium-citrate': 65,
  'calcium-carbonate': 40,
  'potassium': 80,

  // Omega-3
  'fish-oil': 70,
  'krill-oil': 90,
  'dha': 75,
  'epa': 75,
  'algae-dha': 75,
  'alpha-linolenic-acid': 30,
  'flaxseed-oil': 50,

  // CoQ10 / ALA
  'coenzyme-q10': 55,
  'ubiquinol': 85,
  'alpha-lipoic-acid': 45,
  'r-alpha-lipoic-acid': 75,

  // Curcumin / piperine
  'curcumin': 15,
  'curcuma-longa-extract': 30,
  'curcumin-phytosome': 85,
  'piperine': 90,
  'bioperine': 90,

  // Amino acids
  'l-arginine': 60,
  'l-glutamine': 80,
  'l-theanine': 85,
  'l-lysine': 85,
  'l-carnitine': 70,
  'acetyl-l-carnitine': 85,
  'taurine': 80,
  'creatine-monohydrate': 95,
  'creatine': 95,

  // Cognitive
  'phosphatidylserine': 85,
  'citicoline': 90,
  'cdp-choline': 90,
  'uridine-monophosphate': 50,
  'alpha-gpc': 90,

  // Joint
  'glucosamine-sulfate': 80,
  'glucosamine-hcl': 70,
  'chondroitin-sulfate': 50,
  'uc-ii-collagen': 60,
  'type-ii-collagen': 60,
  'msm': 90,
  'marine-collagen': 70,
  'hydrolyzed-collagen': 75,
  'hyaluronic-acid': 40,
  'eggshell-membrane': 70,

  // Antioxidants
  'trans-resveratrol': 25,
  'resveratrol': 25,
  'quercetin': 40,
  'quercetin-phytosome': 80,
  'astaxanthin': 60,
  'green-tea-extract': 60,
  'egcg': 40,
  'citrus-bioflavonoids': 50,
  'lutein': 60,
  'zeaxanthin': 60,
  'pycnogenol': 70,
  'grape-seed-extract': 60,

  // Herbal / Adaptogens
  'ashwagandha': 75,
  'ashwagandha-root-extract': 75,
  'ksm-66': 80,
  'rhodiola-rosea-extract': 70,
  'rhodiola': 70,
  'panax-ginseng-root-extract': 60,
  'panax-ginseng': 60,
  'ginseng': 60,
  'ginsenosides': 60,
  'milk-thistle-extract': 40,
  'silymarin': 40,
  'saw-palmetto-extract': 60,
  'ginkgo-biloba': 70,
  'ginkgo-biloba-extract': 70,
  'maca-root': 60,
  'maca': 60,
  'schisandra-extract': 50,
  'boswellia-serrata': 60,
  'reishi-extract': 50,
  'shiitake-extract': 55,
  'cordyceps': 55,
  'lions-mane': 60,
  'lions-mane-extract': 60,
  'japanese-knotweed-extract': 30,
  'beta-glucan-1-3-1-6': 50,
  'bromelain': 45,
  'l-glutathione': 30,
  'passiflora-incarnata-extract': 60,
  'tribulus-terrestris-extract': 55,
  'cranberry-extract': 70,
  'black-seed-oil': 75,
  'evening-primrose-oil': 70,
  'tribulus-terrestris-fruit-extract': 55,

  // Probiotics (delivery/CFU viability based)
  'lactobacillus-acidophilus': 70,
  'bifidobacterium-lactis': 70,
  'lactobacillus-rhamnosus': 70,
  'bifidobacterium-longum': 70,
  'streptococcus-thermophilus': 70,
  'saccharomyces-boulardii': 75,
  'lactobacillus-plantarum': 70,
  'lactobacillus-casei': 70,
  'lactobacillus-reuteri': 70,

  // Other
  '5-htp': 70,
  'melatonin': 80,
  'gaba': 40,
  'betaine-hcl': 85,
  'd-ribose': 90,
  'pepsin': 80,
  'whey-protein': 95,
  'whey-protein-isolate': 95,
  'whey-protein-concentrate': 90,
  'casein': 85,
  'pea-protein': 80,
  'rice-protein': 75,
  'spirulina': 70,
  'chlorella': 60,
  'mct-oil': 95,
  'inulin': 60,
  'psyllium-husk': 70,
  'apple-cider-vinegar': 70,
  'colostrum': 75,
};

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

  // Only target ingredients currently NULL on bioavail AND in use
  const r = await c.query(
    `SELECT DISTINCT i.ingredient_id, i.ingredient_slug, i.bioavailability_score
     FROM ingredients i
     LEFT JOIN supplement_ingredients pi ON pi.ingredient_id=i.ingredient_id
     WHERE i.bioavailability_score IS NULL AND pi.product_id IS NOT NULL`,
  );
  console.log(`${r.rowCount} NULL bioavail + in-use ingredient`);

  let updated = 0;
  let unmapped: string[] = [];

  for (const row of r.rows) {
    const slug: string = row.ingredient_slug;
    const val = BIOAVAIL[slug];
    if (val == null) {
      unmapped.push(slug);
      continue;
    }
    await c.query(
      `UPDATE ingredients SET bioavailability_score=$1 WHERE ingredient_id=$2`,
      [val, row.ingredient_id],
    );
    updated++;
  }

  console.log(`Updated: ${updated}`);
  if (unmapped.length) {
    console.log(`\nUnmapped (${unmapped.length}), default 60 atanıyor:`);
    for (const slug of unmapped) console.log(`  - ${slug}`);
    // Default 60 for anything evidence-graded but slug not in matrix
    const defRes = await c.query(
      `UPDATE ingredients SET bioavailability_score=60
       WHERE ingredient_id IN (
         SELECT DISTINCT i.ingredient_id FROM ingredients i
         JOIN supplement_ingredients pi ON pi.ingredient_id=i.ingredient_id
         WHERE i.bioavailability_score IS NULL AND i.evidence_grade IS NOT NULL
       )`,
    );
    console.log(`Default 60 uygulandı: ${defRes.rowCount} ingredient`);
  }

  await c.end();
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
