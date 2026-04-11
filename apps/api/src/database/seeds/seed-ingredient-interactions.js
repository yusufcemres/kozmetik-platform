/**
 * Ingredient Interaction Seed Script
 * Bilinen kozmetik ve takviye etkileşimlerini ekler.
 *
 * Kullanım: cd apps/api && node src/database/seeds/seed-ingredient-interactions.js
 */

const { Client } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/kozmetik';

// inci_name -> etkileşim verisi
// Her ikili için ingredient_a ve ingredient_b sırasıyla DB'de aranacak
const INTERACTIONS = [
  // Kozmetik etkileşimleri
  {
    a: 'Retinol',
    b: 'Glycolic Acid',
    severity: 'moderate',
    domain_type: 'cosmetic',
    description: 'Retinol ve Glikolik Asit (AHA) birlikte kullanıldığında tahriş, kuruluk ve pullanma riski artar.',
    recommendation: 'Retinolü akşam, AHA\'yı sabah rutinine taşıyın veya farklı günlerde kullanın.',
  },
  {
    a: 'Retinol',
    b: 'Salicylic Acid',
    severity: 'moderate',
    domain_type: 'cosmetic',
    description: 'Retinol ile Salisilik Asit (BHA) birlikte aşırı eksfoliasyona neden olabilir.',
    recommendation: 'Aynı anda değil, farklı rutinlerde (sabah/akşam) kullanın.',
  },
  {
    a: 'Retinol',
    b: 'Benzoyl Peroxide',
    severity: 'severe',
    domain_type: 'cosmetic',
    description: 'Benzoyl Peroxide retinolü oksitleyerek etkisizleştirir.',
    recommendation: 'Asla aynı rutinde kullanmayın. Farklı günlerde uygulayın.',
  },
  {
    a: 'Retinol',
    b: 'Ascorbic Acid',
    severity: 'mild',
    domain_type: 'cosmetic',
    description: 'Retinol ve C Vitamini farklı pH\'larda etkilidir; birlikte stabiliteleri düşer.',
    recommendation: 'C Vitaminini sabah, retinolü akşam kullanın.',
  },
  {
    a: 'Ascorbic Acid',
    b: 'Niacinamide',
    severity: 'none',
    domain_type: 'cosmetic',
    description: 'Eski bir mit: Vitamin C ve Niacinamide birlikte güvenle kullanılabilir. Leke giderme sinerjisi sağlar.',
    recommendation: 'Birlikte kullanılabilir — sinerji etkisi yaratır.',
  },
  {
    a: 'Ascorbic Acid',
    b: 'Tocopherol',
    severity: 'none',
    domain_type: 'cosmetic',
    description: 'Vitamin C ve Vitamin E birlikte güçlü antioksidan sinerji oluşturur.',
    recommendation: 'Birlikte kullanılması önerilir — antioksidan etki katlanır.',
  },
  {
    a: 'Glycolic Acid',
    b: 'Salicylic Acid',
    severity: 'moderate',
    domain_type: 'cosmetic',
    description: 'AHA ve BHA birlikte aşırı eksfoliasyona, ciltte tahriş ve bariyerhasarına neden olabilir.',
    recommendation: 'Aynı rutinde kullanmayın. AHA sabah, BHA akşam veya farklı günlerde.',
  },
  {
    a: 'Niacinamide',
    b: 'Retinol',
    severity: 'none',
    domain_type: 'cosmetic',
    description: 'Niacinamide retinolün tahriş edici etkisini azaltır ve bariyer onarımını destekler.',
    recommendation: 'Birlikte kullanılması önerilir — retinol toleransını artırır.',
  },
  {
    a: 'Hyaluronic Acid',
    b: 'Ascorbic Acid',
    severity: 'none',
    domain_type: 'cosmetic',
    description: 'Hyaluronik Asit ve C Vitamini birlikte nem ve aydınlatma sinerjisi sağlar.',
    recommendation: 'Birlikte kullanılabilir — güvenli ve etkili kombinasyon.',
  },
  {
    a: 'Retinol',
    b: 'Lactic Acid',
    severity: 'moderate',
    domain_type: 'cosmetic',
    description: 'Retinol ile Laktik Asit (AHA) birlikte tahriş ve hassasiyet riskini artırır.',
    recommendation: 'Farklı rutinlerde kullanın. Retinol akşam, laktik asit sabah.',
  },
  // Takviye etkileşimleri
  {
    a: 'Iron',
    b: 'Calcium',
    severity: 'moderate',
    domain_type: 'supplement',
    description: 'Kalsiyum, demir emilimini önemli ölçüde engeller.',
    recommendation: 'En az 2 saat arayla alın. Demiri aç karnına, kalsiyumu yemekle birlikte alın.',
  },
  {
    a: 'Iron',
    b: 'Ascorbic Acid',
    severity: 'none',
    domain_type: 'supplement',
    description: 'C Vitamini demir emilimini önemli ölçüde artırır — güçlü sinerji.',
    recommendation: 'Demir takviyesini C vitamini ile birlikte alın.',
  },
  {
    a: 'Zinc',
    b: 'Iron',
    severity: 'mild',
    domain_type: 'supplement',
    description: 'Yüksek doz çinko demir emilimini azaltabilir.',
    recommendation: 'Farklı öğünlerde alın.',
  },
  {
    a: 'Calcium',
    b: 'Magnesium',
    severity: 'mild',
    domain_type: 'supplement',
    description: 'Yüksek dozlarda birlikte alındığında emilim rekabeti olabilir.',
    recommendation: 'Kalsiyumu sabah, magnezyumu akşam alın.',
  },
];

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('DB bağlantısı kuruldu');

  let inserted = 0;
  let skipped = 0;
  let notFound = 0;

  for (const inter of INTERACTIONS) {
    // Find ingredient IDs by inci_name (case-insensitive)
    const resA = await client.query(
      `SELECT ingredient_id FROM ingredients WHERE LOWER(inci_name) = LOWER($1) LIMIT 1`,
      [inter.a],
    );
    const resB = await client.query(
      `SELECT ingredient_id FROM ingredients WHERE LOWER(inci_name) = LOWER($1) LIMIT 1`,
      [inter.b],
    );

    if (!resA.rows.length || !resB.rows.length) {
      console.log(`⚠ Bulunamadı: ${inter.a} (${resA.rows.length ? 'OK' : 'YOK'}) ↔ ${inter.b} (${resB.rows.length ? 'OK' : 'YOK'})`);
      notFound++;
      continue;
    }

    const aId = resA.rows[0].ingredient_id;
    const bId = resB.rows[0].ingredient_id;

    // Check if already exists (either direction)
    const existing = await client.query(
      `SELECT 1 FROM ingredient_interactions
       WHERE (ingredient_a_id = $1 AND ingredient_b_id = $2)
          OR (ingredient_a_id = $2 AND ingredient_b_id = $1)
       LIMIT 1`,
      [aId, bId],
    );

    if (existing.rows.length) {
      console.log(`⏩ Zaten var: ${inter.a} ↔ ${inter.b}`);
      skipped++;
      continue;
    }

    await client.query(
      `INSERT INTO ingredient_interactions
        (ingredient_a_id, ingredient_b_id, severity, domain_type, interaction_context, description, recommendation, is_active)
       VALUES ($1, $2, $3, $4, 'ingredient', $5, $6, true)`,
      [aId, bId, inter.severity, inter.domain_type, inter.description, inter.recommendation],
    );
    console.log(`✅ Eklendi: ${inter.a} ↔ ${inter.b} (${inter.severity})`);
    inserted++;
  }

  console.log(`\n--- Özet ---`);
  console.log(`Eklenen: ${inserted}`);
  console.log(`Zaten var: ${skipped}`);
  console.log(`Bulunamayan: ${notFound}`);

  await client.end();
}

main().catch((err) => {
  console.error('Hata:', err);
  process.exit(1);
});
