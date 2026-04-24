/**
 * Rule-based supplement product ↔ ingredient linker.
 *
 * product_ingredients tablosunda bileşeni olmayan supplement ürünleri için:
 *   - product_name + short_description'ı keyword pattern'lere göre tarar
 *   - Eşleşen ingredient'ları product_ingredients'a ekler
 *
 * Sonrasında product_need_scores otomatik hesaplanır (ayrı SQL).
 *
 * Kullanım:
 *   node apps/api/src/scripts/data-quality/link-products-from-name.mjs --dry-run
 *   node apps/api/src/scripts/data-quality/link-products-from-name.mjs --apply
 */
import { Client } from 'pg';
import { config } from 'dotenv';
config();

const args = process.argv.slice(2);
const applyMode = args.includes('--apply');
if (!applyMode && !args.includes('--dry-run')) {
  console.error('Usage: node link-products-from-name.mjs [--dry-run | --apply]');
  process.exit(1);
}

// Pattern → ingredient slugs (birden fazla)
// Sıralama önemli — daha spesifik kural önce, generic sonra
const PATTERNS = [
  { re: /\bd3\s*k2\b|\bd3k2\b/i,             slugs: ['cholecalciferol', 'menaquinone'] },
  { re: /\bmultivitamin|\bmulti[\s-]?vit/i,  slugs: ['cholecalciferol', 'methylcobalamin', 'vitamin-b6', 'folic-acid', 'biotin', 'zinc'] },
  { re: /\bb\s*complex|b[\s-]?kompleks/i,    slugs: ['vitamin-b6', 'methylcobalamin', 'folic-acid', 'niacin', 'biotin'] },
  { re: /\bprobiyotik|probiotic|dophilus/i,  slugs: ['lactobacillus-acidophilus', 'bifidobacterium-lactis'] },
  { re: /\bbigflor\b/i,                      slugs: ['lactobacillus-acidophilus', 'bifidobacterium-lactis'] },
  { re: /\bomega[\s-]?3|\bbalık\s*yağı|fish\s*oil|\bEPA\b|\bDHA\b/i, slugs: ['omega-3'] },
  { re: /\bflaxseed|keten\s*tohumu/i,        slugs: ['omega-3'] },
  { re: /\bkrill\s*oil\b/i,                  slugs: ['omega-3'] },
  { re: /\bd3\b|\bd[\s-]?vitamin|vitamin[\s-]?d|cholecalciferol/i, slugs: ['cholecalciferol'] },
  { re: /\bk2\b|menaquinone/i,               slugs: ['menaquinone'] },
  { re: /\bc[\s-]?vitamin|vitamin[\s-]?c|askorbik|ascorbic/i, slugs: ['ascorbic-acid'] },
  { re: /\bb12\b|metil?kobalamin|cyanocobalamin/i, slugs: ['methylcobalamin'] },
  { re: /\bb6\b|pyridoxine|piridoksin/i,     slugs: ['vitamin-b6'] },
  { re: /\bmagnezyum|magnesium|\bmg\b.*tab|bisglisin|malat|sitrat/i, slugs: ['magnesium'] },
  { re: /\bçinko|zinc/i,                     slugs: ['zinc'] },
  { re: /\bdemir|iron|\bFe\b.*supp/i,        slugs: ['iron'] },
  { re: /\bkalsiyum|calcium/i,               slugs: ['calcium'] },
  { re: /\bselen(yum)?|selenium/i,           slugs: ['selenium'] },
  { re: /\bkolajen|collagen/i,               slugs: ['hydrolyzed-collagen'] },
  { re: /\bbiotin/i,                         slugs: ['biotin'] },
  { re: /\bmelatonin/i,                      slugs: ['melatonin'] },
  { re: /\bkreatin|creatine/i,               slugs: ['creatine'] },
  { re: /\bwhey|whey\s*protein/i,            slugs: ['whey-protein'] },
  { re: /\bbcaa\b/i,                         slugs: ['bcaa'] },
  { re: /\bcoq10|koenzim[\s-]?q10|ubiquinol/i, slugs: ['coq10'] },
  { re: /\bkarnitin|carnitine/i,             slugs: ['l-carnitine'] },
  { re: /\btheanin|teanin/i,                 slugs: ['l-theanine'] },
  { re: /\bashwagandha|withania/i,           slugs: ['ashwagandha'] },
  { re: /\bginseng/i,                        slugs: ['ginseng'] },
  { re: /\brhodiola|altın\s*kök/i,           slugs: ['rhodiola'] },
  { re: /\bbeta[\s-]?glukan|beta[\s-]?glucan/i, slugs: ['beta-glucan'] },
  { re: /\bkuerçetin|quercetin/i,            slugs: ['quercetin'] },
  { re: /\blutein/i,                         slugs: ['lutein'] },
  { re: /\bzeaksantin|zeaxanthin/i,          slugs: ['zeaxanthin'] },
  { re: /\bbilberry|yaban\s*mersini/i,       slugs: ['bilberry'] },
  { re: /\bfolat|folic|metilfolat|5-mthf/i,  slugs: ['folic-acid'] },
  { re: /\bniasin|niacin\b/i,                slugs: ['niacin'] },
  { re: /\bhyaluron(ik|ic)/i,                slugs: ['hyaluronic-acid'] },
  { re: /\bglukozamin|glucosamine/i,         slugs: ['glucosamine'] },
  { re: /\bkondroitin|chondroitin/i,         slugs: ['chondroitin'] },
  { re: /\bmsm\b|methylsulfonylmethane/i,    slugs: ['msm'] },
  { re: /\binulin|inülin/i,                  slugs: ['inulin'] },
  { re: /\bechinacea|ekinezya/i,             slugs: ['echinacea'] },
  { re: /\belderberry|kara\s*mürver|sambucus/i, slugs: ['elderberry'] },
  { re: /\bbacopa/i,                         slugs: ['bacopa-monnieri'] },
  { re: /\bginkgo/i,                         slugs: ['ginkgo-biloba'] },
  { re: /\balpha[\s-]?gpc/i,                 slugs: ['alpha-gpc'] },
  { re: /\bbetaine|betain/i,                 slugs: ['betaine-hcl'] },
  { re: /\bl[\s-]?serin|l[\s-]?serine/i,     slugs: ['l-serine'] },
  { re: /\bl[\s-]?glutamin|glutamine/i,      slugs: ['l-glutamine'] },
  { re: /\btaurin|taurine/i,                 slugs: ['taurine'] }, // belki DB'de yok
  { re: /\be[\s-]?vitamin|vitamin[\s-]?e|tocopherol/i, slugs: ['tocopherol'] },
  { re: /\ba[\s-]?vitamin|vitamin[\s-]?a|retinyl/i, slugs: ['vitamin-a'] },
  { re: /\biodin|iyot|potassium iodide/i,    slugs: ['iodine'] },
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

// Tüm supplement ürünleri al (bileşeni olmayanlar öncelikli ama hepsini al — eksik olanları pattern ile genişletiriz)
const products = await client.query(`
  SELECT p.product_id, p.product_name, p.product_slug, p.short_description,
    (SELECT COUNT(*)::int FROM product_ingredients pi WHERE pi.product_id=p.product_id) AS current_ingredient_count
  FROM products p
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
  ORDER BY p.product_name
`);

// İngredient slug → id lookup
const ingredientsRes = await client.query('SELECT ingredient_id, ingredient_slug, inci_name FROM ingredients');
const ingredientBySlug = new Map(ingredientsRes.rows.map(r => [r.ingredient_slug, r]));

const plan = [];
let unlinkedCount = 0;
let unmatchedByName = [];

for (const p of products.rows) {
  const text = [p.product_name, p.short_description || ''].join(' ');
  const matched = new Set();
  for (const pat of PATTERNS) {
    if (pat.re.test(text)) {
      for (const slug of pat.slugs) {
        if (ingredientBySlug.has(slug)) matched.add(slug);
      }
    }
  }
  if (p.current_ingredient_count === 0) {
    unlinkedCount++;
    if (matched.size === 0) {
      unmatchedByName.push(p.product_name);
    } else {
      plan.push({ product: p, slugs: [...matched] });
    }
  } else if (matched.size > 0) {
    // Zaten bağlı olan ürünlerde eksik ingredient var mı kontrol et
    const existing = await client.query(
      'SELECT ingredient_id FROM product_ingredients WHERE product_id=$1 AND ingredient_id IS NOT NULL',
      [p.product_id],
    );
    const existingIds = new Set(existing.rows.map(x => x.ingredient_id));
    const missing = [...matched].filter(s => !existingIds.has(ingredientBySlug.get(s).ingredient_id));
    if (missing.length > 0) {
      plan.push({ product: p, slugs: missing, augment: true });
    }
  }
}

console.log(`Toplam supplement: ${products.rowCount}`);
console.log(`Bileşeni olmayan: ${unlinkedCount}`);
console.log(`Pattern eşleşmeyen (bağlanamaz): ${unmatchedByName.length}`);
if (unmatchedByName.length > 0) {
  console.log('  Eşleşmeyen örnekler:');
  unmatchedByName.slice(0, 10).forEach(n => console.log('    - ' + n));
}
console.log(`\nPlan: ${plan.length} ürün için ${plan.reduce((s, p) => s + p.slugs.length, 0)} ingredient ekleme`);
console.log('\nİlk 20 plan:');
plan.slice(0, 20).forEach(p => {
  const tag = p.augment ? '[+]' : '[NEW]';
  console.log(`  ${tag} ${p.product.product_name.padEnd(55)} → ${p.slugs.join(', ')}`);
});

if (!applyMode) {
  console.log('\n[DRY-RUN] Değişiklik yok. --apply ile çalıştır.');
  await client.end();
  process.exit(0);
}

// APPLY
console.log('\n[APPLY] Ekleniyor...');
let inserted = 0;
await client.query('BEGIN');
try {
  for (const p of plan) {
    for (let i = 0; i < p.slugs.length; i++) {
      const slug = p.slugs[i];
      const ing = ingredientBySlug.get(slug);
      if (!ing) continue;
      // NOT EXISTS guard (aynı product+ingredient varsa atla)
      const dup = await client.query(
        'SELECT 1 FROM product_ingredients WHERE product_id=$1 AND ingredient_id=$2',
        [p.product.product_id, ing.ingredient_id],
      );
      if (dup.rowCount && dup.rowCount > 0) continue;
      await client.query(
        `INSERT INTO product_ingredients
          (product_id, ingredient_id, ingredient_display_name, inci_order_rank, concentration_band, is_highlighted_in_claims, match_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [p.product.product_id, ing.ingredient_id, ing.inci_name, i + 1, 'high', true, 'auto_from_name'],
      );
      inserted++;
    }
  }
  await client.query('COMMIT');
  console.log(`\n✓ ${inserted} product_ingredient satırı eklendi`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('ROLLBACK:', err.message);
  process.exit(1);
}

// Skoru yeniden hesapla — daha önceki SQL ile aynı mantık
console.log('\n[RECOMPUTE] product_need_scores hesaplanıyor...');
await client.query(`
  DELETE FROM product_need_scores
  WHERE need_id IN (SELECT need_id FROM needs WHERE domain_type IN ('supplement','both'))
    AND product_id IN (SELECT product_id FROM products WHERE domain_type='supplement');
`);
const upsert = await client.query(`
  INSERT INTO product_need_scores (product_id, need_id, compatibility_score, confidence_level, score_reason_summary, calculated_at)
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
  JOIN products p ON p.product_id = pi.product_id
  JOIN ingredient_need_mappings inm ON inm.ingredient_id = pi.ingredient_id
  JOIN needs n ON n.need_id = inm.need_id
  WHERE p.domain_type='supplement' AND p.status IN ('published','active')
    AND n.domain_type IN ('supplement','both')
  GROUP BY pi.product_id, inm.need_id
  HAVING AVG(inm.relevance_score) >= 25
  RETURNING product_need_score_id;
`);
console.log(`✓ ${upsert.rowCount} product_need_scores satırı yazıldı`);

// Audit
const audit = await client.query(`
  SELECT
    (SELECT COUNT(*)::int FROM products p
      WHERE p.domain_type='supplement' AND p.status IN ('published','active')
        AND NOT EXISTS (SELECT 1 FROM product_ingredients pi WHERE pi.product_id=p.product_id)) AS still_unlinked,
    (SELECT COUNT(*)::int FROM products p
      WHERE p.domain_type='supplement' AND p.status IN ('published','active')
        AND NOT EXISTS (SELECT 1 FROM product_need_scores ns WHERE ns.product_id=p.product_id)) AS no_scores
`);
console.log('\n=== POST-APPLY AUDIT ===');
console.log('  Hala bileşeni olmayan:', audit.rows[0].still_unlinked);
console.log('  Skoru olmayan supplement:', audit.rows[0].no_scores);

await client.end();
