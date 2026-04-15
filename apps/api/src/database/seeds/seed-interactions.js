/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Seed: ingredient_interactions (supplement + cosmetic)
 * Idempotent: aynı (a, b, domain, context) için UPDATE, yoksa INSERT.
 * Usage: node apps/api/src/database/seeds/seed-interactions.js [--dry-run]
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DRY = process.argv.includes('--dry-run');

// Slug → (inci_name, common_name) for auto-creating missing ingredients.
const ENSURE = {
  calcium: ['Calcium', 'Kalsiyum'],
  copper: ['Copper', 'Bakır'],
  'vitamin-c': ['Vitamin C', 'C Vitamini'],
  'vitamin-d': ['Vitamin D', 'D Vitamini'],
  'vitamin-e': ['Vitamin E', 'E Vitamini'],
  'vitamin-k2': ['Vitamin K2', 'K2 Vitamini'],
  'vitamin-b6': ['Vitamin B6', 'B6 Vitamini'],
  'omega-3': ['Omega-3', 'Omega-3'],
  curcumin: ['Curcumin', 'Kurkumin'],
  piperine: ['Piperine', 'Piperin'],
  peptides: ['Peptides', 'Peptitler'],
};

async function ensureIngredient(client, slug) {
  const { rows } = await client.query(
    `SELECT ingredient_id FROM ingredients WHERE ingredient_slug = $1 LIMIT 1`, [slug]);
  if (rows.length) return rows[0].ingredient_id;
  const seed = ENSURE[slug];
  if (!seed) return null;
  if (DRY) {
    console.log(`    [DRY] would create ingredient ${slug} (${seed[1]})`);
    return -1;
  }
  const ins = await client.query(
    `INSERT INTO ingredients (ingredient_slug, inci_name, common_name, is_active)
     VALUES ($1, $2, $3, true)
     RETURNING ingredient_id`,
    [slug, seed[0], seed[1]]
  );
  return ins.rows[0].ingredient_id;
}

// a_slug, b_slug, severity, domain, context, description, recommendation
const PAIRS = [
  // === Supplement antagonists (emilim rekabeti) ===
  ['calcium', 'iron', 'moderate', 'supplement', 'ingredient',
    'Kalsiyum demir emilimini azaltır (aynı transport yolu).',
    'En az 2 saat arayla alın. Demiri aç karnına, kalsiyumu yemekle.'],
  ['zinc', 'copper', 'moderate', 'supplement', 'ingredient',
    'Yüksek doz çinko bakır emilimini bloke eder, uzun süreli kullanımda bakır eksikliği riski.',
    '50mg+ çinkoyu 2mg bakırla dengeleyin veya ayrı günlerde kullanın.'],
  ['calcium', 'magnesium', 'mild', 'supplement', 'ingredient',
    'Yüksek doz kalsiyum magnezyum emilimini hafifçe azaltabilir.',
    'İkisini farklı öğünlerde alın; 2:1 Ca:Mg oranı idealdir.'],
  ['iron', 'zinc', 'mild', 'supplement', 'ingredient',
    'Demir ve çinko aynı anda alındığında çinko emilimi düşer.',
    '2 saat arayla veya farklı öğünlerde alın.'],
  ['calcium', 'zinc', 'mild', 'supplement', 'ingredient',
    'Yüksek doz kalsiyum çinko emilimini azaltır.',
    'Farklı öğünlerde alın.'],
  ['magnesium', 'iron', 'mild', 'supplement', 'ingredient',
    'Magnezyum oksit demir emilimini azaltabilir.',
    '2 saat ara koyun, bisglisinat formunu tercih edin.'],

  // === Supplement synergies ===
  ['vitamin-d', 'vitamin-k2', 'synergistic', 'supplement', 'ingredient',
    'D3 kalsiyum emilimini artırır, K2 kalsiyumu kemiğe yönlendirir — birlikte damar kireçlenmesi riskini düşürür.',
    'Aynı öğünde yağla birlikte alın.'],
  ['vitamin-d', 'calcium', 'synergistic', 'supplement', 'ingredient',
    'D vitamini kalsiyum emilimini 2-3 kat artırır.',
    'Aynı öğünde alın.'],
  ['iron', 'vitamin-c', 'synergistic', 'supplement', 'ingredient',
    'C vitamini non-heme demir emilimini 3-6 kat artırır (Fe³⁺ → Fe²⁺).',
    'Demiri 200mg C vitamini ile birlikte aç karnına alın.'],
  ['curcumin', 'piperine', 'synergistic', 'supplement', 'ingredient',
    'Piperin kurkumin biyoyararlanımını %2000 artırır.',
    'Kurkumin takviyelerinde piperin (karabiber ekstresi) bulunmalı veya birlikte alınmalı.'],
  ['omega-3', 'vitamin-e', 'synergistic', 'supplement', 'ingredient',
    'E vitamini omega-3 yağ asitlerini oksidasyondan korur.',
    'Yüksek doz balık yağı + düşük doz doğal E vitamini (tokoferol).'],
  ['magnesium', 'vitamin-b6', 'synergistic', 'supplement', 'ingredient',
    'B6 magnezyumun hücre içi alımını artırır, premenstruel sendrom desteği.',
    'Kombine takviye tercih edin (özellikle P5P formu).'],
  ['zinc', 'vitamin-c', 'synergistic', 'supplement', 'ingredient',
    'Çinko + C vitamini bağışıklık etkisini güçlendirir.',
    'Soğuk algınlığı döneminde birlikte alın.'],

  // === Cosmetic antagonists ===
  ['retinol', 'glycolic-acid', 'severe', 'cosmetic', 'ingredient',
    'Retinol + AHA birlikte kullanımı ciltte tahriş, kızarıklık, bariyer hasarına yol açar.',
    'Farklı günlerde veya sabah (AHA) / akşam (retinol) ayrı kullanın.'],
  ['retinol', 'salicylic-acid', 'moderate', 'cosmetic', 'ingredient',
    'Retinol + BHA kombinasyonu aşırı kurumaya neden olabilir.',
    'Dönüşümlü günlerde kullanın veya önce düşük dozla tolerans geliştirin.'],
  ['retinol', 'benzoyl-peroxide', 'severe', 'cosmetic', 'ingredient',
    'Benzoyl peroxide retinolü oksitler, etkisini nötralize eder.',
    'Sabah BP, akşam retinol uygulayın.'],
  ['vitamin-c', 'retinol', 'mild', 'cosmetic', 'ingredient',
    'Farklı pH aralıklarında etkili — aynı anda uygulama etkinliği düşürür.',
    'Sabah C vitamini, akşam retinol idealdir.'],
  ['niacinamide', 'vitamin-c', 'mild', 'cosmetic', 'ingredient',
    'Eski veriler çelişkili — modern formülasyonlarda sorun yok, ancak yüksek konsantrasyonlarda pH çatışması olabilir.',
    'Farklı katmanlarda veya ayrı öğünlerde uygulanabilir; modern ürünlerde kombine güvenli.'],

  // === Cosmetic synergies ===
  ['hyaluronic-acid', 'niacinamide', 'synergistic', 'cosmetic', 'ingredient',
    'HA nemlendirir, niasinamid bariyeri güçlendirir — birlikte mükemmel uyum.',
    'Önce HA (nemli cilde), sonra niasinamid uygulayın.'],
  ['vitamin-c', 'vitamin-e', 'synergistic', 'cosmetic', 'ingredient',
    'E vitamini C vitamininin oksidasyonunu yavaşlatır, antioksidan etkiyi 4 kat artırır.',
    'Kombine serumlar tercih edin (C+E+ferulic asit).'],
  ['retinol', 'peptides', 'synergistic', 'cosmetic', 'ingredient',
    'Peptitler retinol tahrişini azaltır, anti-aging etkiyi güçlendirir.',
    'Retinol üstüne peptit serumu katmanlayabilirsiniz.'],
  ['niacinamide', 'zinc', 'synergistic', 'cosmetic', 'ingredient',
    'Çinko niasinamidin sebum düzenleyici etkisini güçlendirir, akne eğilimli ciltte etkili.',
    'Kombine ürünlerde 4%+2% kombinasyonu standart.'],
];

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });
  await client.connect();

  let upserted = 0, skipped = 0;
  for (const [aSlug, bSlug, severity, domain, context, desc, rec] of PAIRS) {
    const aId = await ensureIngredient(client, aSlug);
    const bId = await ensureIngredient(client, bSlug);
    if (aId == null || bId == null) {
      console.warn(`[SKIP] ${aSlug} ↔ ${bSlug} — ingredient(s) missing (no ENSURE entry)`);
      skipped++;
      continue;
    }
    if (DRY) {
      console.log(`[DRY] ${aSlug}(${aId}) ↔ ${bSlug}(${bId}) ${severity} [${domain}]`);
      upserted++;
      continue;
    }
    await client.query(
      `INSERT INTO ingredient_interactions
         (ingredient_a_id, ingredient_b_id, severity, domain_type, interaction_context, description, recommendation, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT DO NOTHING`,
      [aId, bId, severity, domain, context, desc, rec]
    );
    upserted++;
  }

  await client.end();
  console.log(`\nDone. upserted=${upserted} skipped=${skipped} total=${PAIRS.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
