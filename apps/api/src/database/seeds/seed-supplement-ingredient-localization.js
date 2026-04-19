/**
 * Supplement ingredient localization + food_sources fix.
 *
 * Fixes the 30-product catalog where many ingredient rows had:
 *   - NULL common_name (slug visible instead of display name)
 *   - English function_summary (batch-4 imports)
 *   - Generic cosmetic function_summary (schema-shared ingredients)
 *   - Empty function_summary
 *   - NULL food_sources (nothing renders in "Besin Kaynakları")
 *
 * Run:  node seed-supplement-ingredient-localization.js [--dry-run]
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

// food_sources şeması: [{ food_name, amount_per_100g, unit, note }]
const UPDATES = [
  // ====== Batch-4 yeni 3 bitki: TR özet + form notu ======
  {
    slug: 'ashwagandha',
    common_name: 'Ashwagandha',
    summary: 'Adaptojen bitki (Withania somnifera). RCT’lerde kortizol ve stres biyobelirteçlerini düşürür, uyku kalitesini iyileştirir.',
    food_sources: [
      { food_name: 'Ashwagandha kökü (kurutulmuş toz)', amount_per_100g: 1500, unit: 'mg', note: 'Standardize ekstreler 300-600mg/gün aralığında klinik etkili doz' },
    ],
  },
  {
    slug: 'maca-root',
    common_name: 'Maca Kökü',
    summary: 'And Dağları bitkisi (Lepidium meyenii). RCT’lerde cinsel iyi oluş ve ruh haline olumlu etki ile ilişkilendirilmiştir.',
    food_sources: [
      { food_name: 'Maca kökü (kurutulmuş)', amount_per_100g: 3000, unit: 'mg', note: 'Günlük 1500-3000mg etkili doz' },
    ],
  },
  {
    slug: 'ginkgo-biloba',
    common_name: 'Ginkgo Biloba',
    summary: 'Standardize yaprak ekstresi (EGb 761). Cochrane: demans ilişkili bilişsel semptomlarda mütevazı etki.',
    food_sources: [
      { food_name: 'Ginkgo biloba yaprağı ekstresi', amount_per_100g: 240, unit: 'mg', note: 'Standardize ekstre 120-240mg/gün' },
    ],
  },

  // ====== Mineral formları: TR özet + common_name + food_sources ======
  {
    slug: 'iron-bisglycinate',
    common_name: 'Demir Bisglisinat',
    summary: 'Şelatlı demir formu; demir sülfata göre gastrointestinal yan etki daha az, biyoyararlanım daha yüksek. Demir eksikliği anemisinde klinik kanıt güçlü.',
    food_sources: [
      { food_name: 'Dana ciğeri', amount_per_100g: 6.5, unit: 'mg', note: 'Hem demir — yüksek biyoyararlanım' },
      { food_name: 'Kırmızı et (sığır)', amount_per_100g: 2.6, unit: 'mg', note: 'Hem demir' },
      { food_name: 'Mercimek (haşlanmış)', amount_per_100g: 3.3, unit: 'mg', note: 'Non-hem — C vitamini ile emilim artar' },
      { food_name: 'Ispanak (haşlanmış)', amount_per_100g: 3.6, unit: 'mg', note: 'Non-hem' },
    ],
  },
  {
    slug: 'magnesium-bisglycinate',
    common_name: 'Magnezyum Bisglisinat',
    summary: 'Şelatlı magnezyum formu; oksit/sitrat formlarına göre daha iyi emilir ve daha az laksatif etkilidir. Kas gevşemesi, uyku ve stres desteği için kullanılır.',
    food_sources: [
      { food_name: 'Kabak çekirdeği', amount_per_100g: 592, unit: 'mg', note: 'En zengin doğal kaynak' },
      { food_name: 'Badem', amount_per_100g: 270, unit: 'mg' },
      { food_name: 'Kaju', amount_per_100g: 292, unit: 'mg' },
      { food_name: 'Bitter çikolata (%70+)', amount_per_100g: 228, unit: 'mg' },
      { food_name: 'Ispanak (haşlanmış)', amount_per_100g: 87, unit: 'mg' },
    ],
  },
  {
    slug: 'zinc-picolinate',
    common_name: 'Çinko Pikolinat',
    summary: 'Pikolinik asitle şelatlı çinko; glukonat ve sitrata kıyasla üstün emilim profili. Bağışıklık, cilt ve üreme sağlığı için temel mineral.',
    food_sources: [
      { food_name: 'İstiridye', amount_per_100g: 78.6, unit: 'mg', note: 'En zengin doğal kaynak' },
      { food_name: 'Dana eti', amount_per_100g: 7, unit: 'mg' },
      { food_name: 'Kabak çekirdeği', amount_per_100g: 10.3, unit: 'mg' },
      { food_name: 'Mercimek', amount_per_100g: 4.8, unit: 'mg' },
    ],
  },
  {
    slug: 'methylcobalamin',
    common_name: 'B12 Vitamini (Metilkobalamin)',
    summary: 'B12 vitamininin aktif koenzim formu; siyanokobalamine göre hücresel düzeyde daha hızlı kullanılabilir. Sinir sistemi ve kırmızı kan hücresi üretimi için gerekli.',
    food_sources: [
      { food_name: 'Dana ciğeri', amount_per_100g: 70, unit: 'mcg', note: 'En zengin doğal kaynak' },
      { food_name: 'Uskumru', amount_per_100g: 19, unit: 'mcg' },
      { food_name: 'Somon', amount_per_100g: 4.9, unit: 'mcg' },
      { food_name: 'Yumurta', amount_per_100g: 1.1, unit: 'mcg' },
      { food_name: 'Süt (tam yağlı)', amount_per_100g: 0.4, unit: 'mcg' },
    ],
  },
  {
    slug: 'marine-collagen',
    common_name: 'Deniz Kolajeni',
    summary: 'Balık kaynaklı hidrolize Tip 1 kolajen peptitleri; cilt elastikiyeti ve nem metaanalizlerinde iyileşme göstermiştir. 2500-10000mg/gün aralığında çalışılmış.',
    food_sources: [
      { food_name: 'Balık derisi/kılçığı', amount_per_100g: 8000, unit: 'mg', note: 'Balık suyu kaynatmasından elde edilir' },
      { food_name: 'Kemik suyu', amount_per_100g: 6000, unit: 'mg', note: 'Tavuk/sığır kemiklerinden uzun süre kaynatma' },
    ],
  },
  {
    slug: 'magnesium-citrate',
    common_name: 'Magnezyum Sitrat',
    summary: 'Sitrik asitle birleşmiş magnezyum; iyi emilen, hafif laksatif etkili form. Kas krampları, kabızlık ve migren profilaksisinde kullanılır.',
  },
  {
    slug: 'zinc-gluconate',
    common_name: 'Çinko Glukonat',
    summary: 'Glukonik asit tuzu olarak çinko; iyi tolere edilen yaygın form. Soğuk algınlığı süresinin kısaltılmasında RCT desteği vardır.',
  },

  // ====== Vitamin/Enzim: common_name var ama function_summary boş/yanlış ======
  {
    slug: 'coenzyme-q10',
    summary: 'Hücresel enerji üretiminde (ATP) kofaktör; mitokondriyal fonksiyon ve antioksidan savunma için gerekli. Statin kullananlarda ve yaşlanmayla birlikte seviyesi düşer.',
    food_sources: [
      { food_name: 'Dana kalbi', amount_per_100g: 11.3, unit: 'mg', note: 'En zengin doğal kaynak' },
      { food_name: 'Somon', amount_per_100g: 4.3, unit: 'mg' },
      { food_name: 'Sardalya', amount_per_100g: 6.4, unit: 'mg' },
      { food_name: 'Tavuk göğsü', amount_per_100g: 1.4, unit: 'mg' },
    ],
  },
  {
    slug: 'melatonin',
    common_name: 'Melatonin',
    summary: 'Pineal bez tarafından salgılanan uyku-uyanıklık döngüsü hormonu. 0.5-5mg dozlarda uyku başlangıç süresini kısaltır ve jet lag semptomlarını azaltır.',
    food_sources: [
      { food_name: 'Vişne', amount_per_100g: 0.01, unit: 'mg', note: 'Doğal melatonin içeren tek gıda grubu' },
      { food_name: 'Ceviz', amount_per_100g: 0.003, unit: 'mg' },
    ],
  },
  {
    slug: 'biotin',
    common_name: 'Biotin (B7 Vitamini)',
  },
  {
    slug: 'curcumin',
    common_name: 'Kurkumin',
    summary: 'Zerdeçalın (Curcuma longa) aktif bileşeni; güçlü anti-enflamatuar ve antioksidan. Biyoyararlanımı düşük olduğu için piperinle birlikte alınır.',
    food_sources: [
      { food_name: 'Zerdeçal (toz)', amount_per_100g: 3000, unit: 'mg', note: '%2-5 kurkumin içerir; piperin emilimi 20x artırır' },
    ],
  },
  {
    slug: 'piperine',
    summary: 'Karabiberin aktif alkaloidi; kurkumin ve diğer bileşiklerin biyoyararlanımını %2000’e kadar artırır (RCT, Shoba 1998).',
    food_sources: [
      { food_name: 'Karabiber (toz)', amount_per_100g: 5000, unit: 'mg', note: '%4-7 piperin' },
    ],
  },
  {
    slug: 'magnesium',
    summary: 'Vücutta 300’den fazla enzim reaksiyonunda kofaktör; kas, sinir, kemik ve kalp ritmi için kritik. Eksiklik çok yaygın (%50 TR’de).',
  },
  {
    slug: 'vitamin-c',
    summary: 'Güçlü suda çözünen antioksidan; kolajen sentezi, bağışıklık ve demir emilimi için gerekli. RDA: 75-90mg, takviye dozları 500-1000mg güvenli.',
  },
  {
    slug: 'zinc',
    summary: 'Bağışıklık, yara iyileşmesi, DNA sentezi ve üreme sağlığı için temel iz element. TR’de eksiklik oranı yüksek (%30+).',
  },
  {
    slug: 'evening-primrose-oil',
    common_name: 'Çuha Çiçeği Yağı',
  },
  {
    slug: 'alpha-linolenic-acid',
    common_name: 'Alfa Linolenik Asit (ALA)',
  },
  {
    slug: 'hydrolyzed-collagen',
    common_name: 'Hidrolize Kolajen',
  },
];

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  let updated = 0, notFound = 0;
  try {
    for (const u of UPDATES) {
      const sets = [];
      const vals = [u.slug];
      let idx = 2;
      if (u.common_name !== undefined) { sets.push(`common_name = $${idx++}`); vals.push(u.common_name); }
      if (u.summary !== undefined) { sets.push(`function_summary = $${idx++}`); vals.push(u.summary); }
      if (u.food_sources !== undefined) { sets.push(`food_sources = $${idx++}::jsonb`); vals.push(JSON.stringify(u.food_sources)); }
      if (sets.length === 0) continue;
      sets.push(`updated_at = now()`);

      if (DRY) { console.log(`  [DRY] ${u.slug} → ${sets.length - 1} field(s)`); continue; }

      const res = await client.query(
        `UPDATE ingredients SET ${sets.join(', ')} WHERE ingredient_slug = $1 RETURNING ingredient_id`,
        vals,
      );
      if (res.rowCount === 0) { console.log(`  [NOT FOUND] ${u.slug}`); notFound++; }
      else { console.log(`  [UPD] ${u.slug} → ${sets.length - 1} field(s)`); updated++; }
    }
  } finally {
    await client.end();
  }
  console.log(`\n=== Summary ===\n  updated   = ${updated}\n  notfound  = ${notFound}\n  total     = ${UPDATES.length}`);
}

main().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
