/**
 * Product Tree Sync — her yeni ürün eklemesinden sonra çalıştırılması gereken orkestratör.
 *
 * Yeni ürün ekleme pipeline'ının tamamlayıcı adımı. 3 iş yapar:
 *
 *   1. LINK: product_ingredients'ı pattern matching ile doldurur (yalnız boş olan ürünler)
 *   2. SCORE: product_need_scores'u tüm supplement + kozmetik için compute/refresh eder
 *   3. AUDIT: connection tree raporu — bağlanmamış/skorsuz kalan yerleri loglar
 *
 * Kullanım (manuel):
 *   node apps/api/src/scripts/data-quality/sync-product-tree.mjs --apply
 *
 * Kullanım (ingest pipeline sonrası — auto):
 *   supplement-bulk-ingest.ts veya cosmetic-ingest son aşamada shell exec:
 *   { exec } = require('child_process');
 *   exec('node apps/api/src/scripts/data-quality/sync-product-tree.mjs --apply --quiet');
 *
 * Kullanım (cron — günlük):
 *   Render cron job: 03:00 UTC
 */
import { spawn } from 'child_process';
import { Client } from 'pg';
import { config } from 'dotenv';
config();

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const quiet = args.includes('--quiet');
const log = (...a) => { if (!quiet) console.log(...a); };

if (!apply) {
  console.error('Bu script changes yapar. --apply flag gerekli.');
  console.error('Usage: node sync-product-tree.mjs --apply [--quiet]');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const started = Date.now();

// ============================================================================
// STEP 1 — LINK: pattern-based product_ingredients fill
// ============================================================================
log('\n[1/3] LINK: product_ingredients fill (pattern matching)...');

// PATTERNS inline — link-products-from-name.mjs ile aynı set
const PATTERNS = [
  { re: /\bd3\s*k2\b|\bd3k2\b/i,                slugs: ['cholecalciferol', 'menaquinone'] },
  { re: /\bmultivitamin|\bmulti[\s-]?vit/i,     slugs: ['cholecalciferol', 'methylcobalamin', 'vitamin-b6', 'folic-acid', 'biotin', 'zinc'] },
  { re: /\bb\s*complex|b[\s-]?kompleks/i,       slugs: ['vitamin-b6', 'methylcobalamin', 'folic-acid', 'niacin', 'biotin'] },
  { re: /\bprobiyotik|probiotic|dophilus/i,     slugs: ['lactobacillus-acidophilus', 'bifidobacterium-lactis'] },
  { re: /\bbigflor\b/i,                         slugs: ['lactobacillus-acidophilus', 'bifidobacterium-lactis'] },
  { re: /\bomega[\s-]?3|\bbalık\s*yağı|fish\s*oil|\bEPA\b|\bDHA\b/i, slugs: ['omega-3'] },
  { re: /\bflaxseed|keten\s*tohumu/i,           slugs: ['omega-3'] },
  { re: /\bkrill\s*oil\b/i,                     slugs: ['omega-3'] },
  { re: /\bd3\b|\bd[\s-]?vitamin|vitamin[\s-]?d|cholecalciferol/i, slugs: ['cholecalciferol'] },
  { re: /\bk2\b|menaquinone/i,                  slugs: ['menaquinone'] },
  { re: /\bc[\s-]?vitamin|vitamin[\s-]?c|askorbik|ascorbic/i, slugs: ['ascorbic-acid'] },
  { re: /\bb12\b|metil?kobalamin|cyanocobalamin/i, slugs: ['methylcobalamin'] },
  { re: /\bb6\b|pyridoxine|piridoksin/i,        slugs: ['vitamin-b6'] },
  { re: /\bmagnezyum|magnesium|bisglisin|malat|sitrat/i, slugs: ['magnesium'] },
  { re: /\bçinko|zinc/i,                        slugs: ['zinc'] },
  { re: /\bdemir|iron/i,                        slugs: ['iron'] },
  { re: /\bkalsiyum|calcium/i,                  slugs: ['calcium'] },
  { re: /\bselen(yum)?|selenium/i,              slugs: ['selenium'] },
  { re: /\bkolajen|collagen/i,                  slugs: ['hydrolyzed-collagen'] },
  { re: /\bbiotin/i,                            slugs: ['biotin'] },
  { re: /\bmelatonin/i,                         slugs: ['melatonin'] },
  { re: /\bkreatin|creatine/i,                  slugs: ['creatine'] },
  { re: /\bwhey/i,                              slugs: ['whey-protein'] },
  { re: /\bbcaa\b/i,                            slugs: ['bcaa'] },
  { re: /\bcoq10|koenzim[\s-]?q10|ubiquinol/i,  slugs: ['coq10'] },
  { re: /\bkarnitin|carnitine/i,                slugs: ['l-carnitine'] },
  { re: /\btheanin|teanin/i,                    slugs: ['l-theanine'] },
  { re: /\bashwagandha|withania/i,              slugs: ['ashwagandha'] },
  { re: /\bginseng/i,                           slugs: ['ginseng'] },
  { re: /\brhodiola|altın\s*kök/i,              slugs: ['rhodiola'] },
  { re: /\bbeta[\s-]?glukan|beta[\s-]?glucan/i, slugs: ['beta-glucan'] },
  { re: /\bkuerçetin|quercetin/i,               slugs: ['quercetin'] },
  { re: /\blutein/i,                            slugs: ['lutein'] },
  { re: /\bzeaksantin|zeaxanthin/i,             slugs: ['zeaxanthin'] },
  { re: /\bbilberry|yaban\s*mersini/i,          slugs: ['bilberry'] },
  { re: /\bfolat|folic|metilfolat/i,            slugs: ['folic-acid'] },
  { re: /\bniasin|niacin\b/i,                   slugs: ['niacin'] },
  { re: /\bhyaluron(ik|ic)/i,                   slugs: ['hyaluronic-acid'] },
  { re: /\bglukozamin|glucosamine/i,            slugs: ['glucosamine'] },
  { re: /\bkondroitin|chondroitin/i,            slugs: ['chondroitin'] },
  { re: /\bmsm\b/i,                             slugs: ['msm'] },
  { re: /\binulin|inülin/i,                     slugs: ['inulin'] },
  { re: /\bechinacea|ekinezya/i,                slugs: ['echinacea'] },
  { re: /\belderberry|kara\s*mürver|sambucus/i, slugs: ['elderberry'] },
  { re: /\bbacopa/i,                            slugs: ['bacopa-monnieri'] },
  { re: /\bginkgo/i,                            slugs: ['ginkgo-biloba'] },
  { re: /\balpha[\s-]?gpc/i,                    slugs: ['alpha-gpc'] },
  { re: /\bbetaine|betain/i,                    slugs: ['betaine-hcl'] },
  { re: /\bcurcumin|zerdeçal|turmeric/i,        slugs: ['curcumin'] },
  { re: /\bmaca\b/i,                            slugs: ['maca-root'] },
  { re: /\b5[\s-]?htp\b/i,                      slugs: ['5-htp'] },
  { re: /\balpha[\s-]?lipoic|alfa[\s-]?lipoik/i, slugs: ['alpha-lipoic-acid'] },
  { re: /\bastaxanthin|astaksantin/i,           slugs: ['astaxanthin'] },
  { re: /\bbromelain/i,                         slugs: ['bromelain'] },
  { re: /\bchromium|krom/i,                     slugs: ['chromium-picolinate'] },
  { re: /\bresveratrol/i,                       slugs: ['resveratrol'] },
  { re: /\biyot|iodine|potassium\s*iodide/i,    slugs: ['iodine'] },
  { re: /\barginin|arginine/i,                  slugs: ['l-arginine'] },
  { re: /\bmyo[\s-]?inositol|myo\s*inositol/i,  slugs: ['myo-inositol'] },
  { re: /\binositol|inozitol/i,                 slugs: ['inositol'] },
  { re: /\btaurin|taurine/i,                    slugs: ['taurine'] },
  { re: /\bpropolis/i,                          slugs: ['propolis'] },
  { re: /\bsilymarin|silimarin/i,               slugs: ['silymarin'] },
  { re: /\bglutathione|glutatyon/i,             slugs: ['glutathione'] },
  { re: /\bphosphatidylserine|fosfatidilserin/i, slugs: ['phosphatidylserine'] },
  { re: /\bd[\s-]?riboz|d[\s-]?ribose/i,        slugs: ['d-ribose'] },
  { re: /\bevening\s*primrose|çuha\s*çiçeği/i,  slugs: ['evening-primrose-oil'] },
  { re: /\be[\s-]?vitamin|vitamin[\s-]?e|tocopherol/i, slugs: ['tocopherol'] },
  { re: /\ba[\s-]?vitamin|vitamin[\s-]?a|retinyl/i, slugs: ['vitamin-a'] },
];

// Sadece product_ingredients'ı boş olan supplement ürünleri
const unlinked = await client.query(`
  SELECT p.product_id, p.product_name, p.short_description
  FROM products p
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
    AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id=p.product_id)
`);

const ingredientsRes = await client.query('SELECT ingredient_id, ingredient_slug, inci_name FROM ingredients');
const ingredientBySlug = new Map(ingredientsRes.rows.map(r => [r.ingredient_slug, r]));

let linkCount = 0;
let unmatched = [];
for (const p of unlinked.rows) {
  const text = [p.product_name, p.short_description || ''].join(' ');
  const matched = new Set();
  for (const pat of PATTERNS) {
    if (pat.re.test(text)) for (const slug of pat.slugs) if (ingredientBySlug.has(slug)) matched.add(slug);
  }
  if (matched.size === 0) { unmatched.push(p.product_name); continue; }
  const slugs = [...matched];
  for (let i = 0; i < slugs.length; i++) {
    const ing = ingredientBySlug.get(slugs[i]);
    await client.query(
      `INSERT INTO product_ingredients
        (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band, is_highlighted_in_claims, match_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [p.product_id, ing.ingredient_id, ing.inci_name, i + 1, 'high', true, 'auto_sync'],
    );
    linkCount++;
  }
}
log(`  ✓ ${linkCount} ingredient bağlandı, ${unlinked.rowCount - unmatched.length}/${unlinked.rowCount} ürün eşleşti`);
if (unmatched.length > 0 && !quiet) {
  log(`  ⚠ ${unmatched.length} ürün pattern eşleşmedi (manuel gerek):`);
  unmatched.slice(0, 5).forEach(n => log('    - ' + n));
}

// ============================================================================
// STEP 2 — SCORE: product_need_scores recompute
// ============================================================================
log('\n[2/3] SCORE: product_need_scores recompute...');

// Supplement: DELETE+INSERT (clean slate)
await client.query(`
  DELETE FROM product_need_scores
  WHERE need_id IN (SELECT need_id FROM needs WHERE domain_type IN ('supplement','both'))
    AND product_id IN (SELECT product_id FROM products WHERE domain_type='supplement');
`);
const suppInsert = await client.query(`
  INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, score_reason_summary, calculated_at)
  SELECT pi.product_id, inm.need_id,
    ROUND(AVG(inm.relevance_score * CASE inm.effect_type
      WHEN 'direct_support' THEN 1.00 WHEN 'indirect_support' THEN 0.75
      WHEN 'complementary' THEN 0.55 WHEN 'caution_related' THEN 0.25
      ELSE 0.50 END))::numeric(5,2),
    CASE WHEN COUNT(*) >= 4 THEN 'high' WHEN COUNT(*) >= 2 THEN 'medium' ELSE 'low' END,
    COUNT(*) || ' bileşen bu ihtiyaca katkı sağlıyor',
    NOW()
  FROM product_ingredients pi
  JOIN products p ON p.product_id = pi.product_id
  JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
  JOIN needs n ON n.need_id = inm.need_id
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
    AND n.domain_type IN ('supplement','both')
  GROUP BY pi.product_id, inm.need_id
  HAVING AVG(inm.relevance_score) >= 25
  RETURNING product_need_score_id;
`);
log(`  ✓ Supplement: ${suppInsert.rowCount} skor yazıldı`);

// Kozmetik: sadece skorsuz olanları ekle (mevcut 1540 skorlu ürüne dokunma)
const cosInsert = await client.query(`
  INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, score_reason_summary, calculated_at)
  SELECT pi.product_id, inm.need_id,
    ROUND(AVG(inm.relevance_score * CASE inm.effect_type
      WHEN 'direct_support' THEN 1.00 WHEN 'indirect_support' THEN 0.75
      WHEN 'complementary' THEN 0.55 WHEN 'caution_related' THEN 0.25
      ELSE 0.50 END))::numeric(5,2),
    CASE WHEN COUNT(*) >= 4 THEN 'high' WHEN COUNT(*) >= 2 THEN 'medium' ELSE 'low' END,
    COUNT(*) || ' bileşen bu ihtiyaca katkı sağlıyor',
    NOW()
  FROM product_ingredients pi
  JOIN products p ON p.product_id = pi.product_id
  JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
  JOIN needs n ON n.need_id = inm.need_id
  WHERE p.domain_type='cosmetic' AND p.status IN ('published','active')
    AND n.domain_type IN ('cosmetic','both')
    AND NOT EXISTS (SELECT 1 FROM product_need_scores ns WHERE ns.product_id=p.product_id)
  GROUP BY pi.product_id, inm.need_id
  HAVING AVG(inm.relevance_score) >= 25
  RETURNING product_need_score_id;
`);
log(`  ✓ Kozmetik (sadece eksik): ${cosInsert.rowCount} skor yazıldı`);

// ============================================================================
// STEP 3 — AUDIT: rapor
// ============================================================================
log('\n[3/3] AUDIT: connection tree sağlık raporu...');
const audit = await client.query(`
  SELECT
    (SELECT COUNT(*)::int FROM products WHERE domain_type='supplement' AND status IN ('published','active')) AS supp_total,
    (SELECT COUNT(*)::int FROM products p WHERE p.domain_type='supplement' AND p.status IN ('published','active')
      AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id=p.product_id)) AS supp_no_ing,
    (SELECT COUNT(*)::int FROM products p WHERE p.domain_type='supplement' AND p.status IN ('published','active')
      AND NOT EXISTS (SELECT 1 FROM product_need_scores ns WHERE ns.product_id=p.product_id)) AS supp_no_score,
    (SELECT COUNT(*)::int FROM products WHERE domain_type='cosmetic' AND status IN ('published','active')) AS cos_total,
    (SELECT COUNT(*)::int FROM products p WHERE p.domain_type='cosmetic' AND p.status IN ('published','active')
      AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id=p.product_id)) AS cos_no_ing,
    (SELECT COUNT(*)::int FROM products p WHERE p.domain_type='cosmetic' AND p.status IN ('published','active')
      AND NOT EXISTS (SELECT 1 FROM product_need_scores ns WHERE ns.product_id=p.product_id)) AS cos_no_score
`);
const a = audit.rows[0];
log(`  Supplement: ${a.supp_total} toplam, ${a.supp_no_ing} ingredient'sız, ${a.supp_no_score} skorsuz`);
log(`  Kozmetik  : ${a.cos_total} toplam, ${a.cos_no_ing} ingredient'sız, ${a.cos_no_score} skorsuz`);
const suppCov = ((a.supp_total - a.supp_no_score) / a.supp_total * 100).toFixed(1);
const cosCov = ((a.cos_total - a.cos_no_score) / a.cos_total * 100).toFixed(1);
log(`  Kapsama   : Supplement %${suppCov} · Kozmetik %${cosCov}`);

await client.end();
log(`\n✓ Tamamlandı ${((Date.now() - started) / 1000).toFixed(1)}s`);
