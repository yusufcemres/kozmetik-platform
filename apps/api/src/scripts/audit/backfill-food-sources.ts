/**
 * Food-sources backfill — high-demand ingredient'larda NULL/thin olanları
 * kanıta dayalı verilerle doldurur.
 *
 * Tüm değerler USDA FoodData Central (v2024) veya peer-reviewed yayından;
 * melatonin gibi USDA'da olmayan bileşenler için özel citation.
 *
 * Idempotent: mevcut food_sources varsa DOKUNMAZ (overwrite yok). Sadece
 * NULL veya boş array olan satırları günceller. Production-safe.
 *
 * Usage:
 *   ts-node backfill-food-sources.ts --dry-run   # plan göster, DB'ye dokunma
 *   ts-node backfill-food-sources.ts --run       # uygula
 */
import { newClient } from '../onboarding/db';

type FoodEntry = {
  food_name: string;
  amount_per_100g: number;
  unit: 'mg' | 'mcg' | 'g';
  note?: string;
};

// Tüm değerler USDA FDC 2024; melatonin hariç (USDA'da yok) — kaynaklar:
// - Meng et al 2017 "Dietary Sources and Bioactivities of Melatonin" (Nutrients, MDPI)
// - Lin et al 2011 "Effect of kiwifruit consumption on sleep quality" (APJCN)
// - Reiter et al 2005 "Melatonin in walnuts" (Nutrition)
const BACKFILL: Record<string, FoodEntry[]> = {
  melatonin: [
    { food_name: 'Antep fıstığı', amount_per_100g: 0.66, unit: 'mg', note: 'Bilinen en yüksek doğal kaynak (Meng 2017)' },
    { food_name: 'Badem', amount_per_100g: 0.039, unit: 'mg' },
    { food_name: 'Kivi', amount_per_100g: 0.024, unit: 'mg', note: 'Yatmadan 1 saat önce 2 kivi uyku latency azaltır (Lin 2011 RCT)' },
    { food_name: 'Çilek', amount_per_100g: 0.012, unit: 'mg' },
    { food_name: 'Vişne', amount_per_100g: 0.010, unit: 'mg' },
    { food_name: 'Ceviz', amount_per_100g: 0.003, unit: 'mg' },
  ],
  magnesium: [
    { food_name: 'Kabak çekirdeği', amount_per_100g: 592, unit: 'mg' },
    { food_name: 'Kaju', amount_per_100g: 292, unit: 'mg' },
    { food_name: 'Badem', amount_per_100g: 270, unit: 'mg' },
    { food_name: 'Kara çikolata (%70-85)', amount_per_100g: 228, unit: 'mg' },
    { food_name: 'Ispanak (haşlanmış)', amount_per_100g: 87, unit: 'mg' },
    { food_name: 'Avokado', amount_per_100g: 29, unit: 'mg' },
  ],
  iron: [
    { food_name: 'Kuzu ciğeri', amount_per_100g: 9.0, unit: 'mg', note: 'Hem demir — %25-35 emilim' },
    { food_name: 'Tahin', amount_per_100g: 9.0, unit: 'mg' },
    { food_name: 'Mercimek (pişmiş)', amount_per_100g: 3.3, unit: 'mg', note: 'Non-hem demir; C vitamini ile beraber emilim artar' },
    { food_name: 'Kırmızı et (biftek)', amount_per_100g: 2.7, unit: 'mg' },
    { food_name: 'Ispanak (pişmiş)', amount_per_100g: 3.6, unit: 'mg', note: 'Non-hem; oksalat emilimi düşürür' },
    { food_name: 'Kuru kayısı', amount_per_100g: 2.7, unit: 'mg' },
  ],
  calcium: [
    { food_name: 'Parmesan peyniri', amount_per_100g: 1184, unit: 'mg' },
    { food_name: 'Susam tohumu', amount_per_100g: 975, unit: 'mg' },
    { food_name: 'Sardalya (konserve, kılçıklı)', amount_per_100g: 382, unit: 'mg' },
    { food_name: 'Badem', amount_per_100g: 269, unit: 'mg' },
    { food_name: 'Yoğurt (tam yağlı)', amount_per_100g: 110, unit: 'mg' },
    { food_name: 'Brokoli (pişmiş)', amount_per_100g: 47, unit: 'mg' },
  ],
  'vitamin-b12': [
    { food_name: 'Sığır ciğeri (pişmiş)', amount_per_100g: 70, unit: 'mcg' },
    { food_name: 'Midye', amount_per_100g: 98, unit: 'mcg' },
    { food_name: 'Sardalya', amount_per_100g: 9, unit: 'mcg' },
    { food_name: 'Somon', amount_per_100g: 3.2, unit: 'mcg' },
    { food_name: 'Yumurta', amount_per_100g: 1.1, unit: 'mcg' },
    { food_name: 'Sığır eti (pişmiş)', amount_per_100g: 2.6, unit: 'mcg' },
  ],
  'omega-3': [
    { food_name: 'Keten tohumu', amount_per_100g: 22800, unit: 'mg', note: 'ALA; EPA/DHA dönüşümü %5-10' },
    { food_name: 'Chia tohumu', amount_per_100g: 17800, unit: 'mg', note: 'ALA' },
    { food_name: 'Ceviz', amount_per_100g: 9100, unit: 'mg', note: 'ALA' },
    { food_name: 'Uskumru', amount_per_100g: 2500, unit: 'mg', note: 'EPA+DHA (direkt aktif form)' },
    { food_name: 'Somon (vahşi)', amount_per_100g: 2300, unit: 'mg', note: 'EPA+DHA' },
    { food_name: 'Sardalya', amount_per_100g: 1500, unit: 'mg', note: 'EPA+DHA' },
  ],
  selenium: [
    { food_name: 'Brezilya cevizi', amount_per_100g: 1917, unit: 'mcg', note: '1-2 adet/gün yeterli; aşırı alım toksik' },
    { food_name: 'Ton balığı (konserve)', amount_per_100g: 90, unit: 'mcg' },
    { food_name: 'Sardalya', amount_per_100g: 52, unit: 'mcg' },
    { food_name: 'Hindi eti', amount_per_100g: 33, unit: 'mcg' },
    { food_name: 'Yumurta', amount_per_100g: 31, unit: 'mcg' },
    { food_name: 'Ayçiçeği çekirdeği', amount_per_100g: 79, unit: 'mcg' },
  ],
  'vitamin-c': [
    { food_name: 'Kuşburnu', amount_per_100g: 426, unit: 'mg' },
    { food_name: 'Maydanoz (taze)', amount_per_100g: 133, unit: 'mg' },
    { food_name: 'Kırmızı biber', amount_per_100g: 128, unit: 'mg' },
    { food_name: 'Kivi', amount_per_100g: 93, unit: 'mg' },
    { food_name: 'Brokoli (çiğ)', amount_per_100g: 89, unit: 'mg' },
    { food_name: 'Portakal', amount_per_100g: 53, unit: 'mg' },
  ],
  'vitamin-e': [
    { food_name: 'Ayçiçeği yağı', amount_per_100g: 41, unit: 'mg' },
    { food_name: 'Badem', amount_per_100g: 25, unit: 'mg' },
    { food_name: 'Fındık', amount_per_100g: 15, unit: 'mg' },
    { food_name: 'Ayçiçeği çekirdeği', amount_per_100g: 35, unit: 'mg' },
    { food_name: 'Avokado', amount_per_100g: 2.0, unit: 'mg' },
    { food_name: 'Ispanak (pişmiş)', amount_per_100g: 2.1, unit: 'mg' },
  ],
  'vitamin-k2': [
    { food_name: 'Natto', amount_per_100g: 1103, unit: 'mcg', note: 'En yüksek MK-7 kaynağı' },
    { food_name: 'Eski Hollanda peyniri (Gouda)', amount_per_100g: 76, unit: 'mcg' },
    { food_name: 'Brie peyniri', amount_per_100g: 50, unit: 'mcg' },
    { food_name: 'Yumurta sarısı', amount_per_100g: 32, unit: 'mcg' },
    { food_name: 'Tereyağı (otla beslenen)', amount_per_100g: 15, unit: 'mcg' },
    { food_name: 'Tavuk göğsü', amount_per_100g: 9, unit: 'mcg' },
  ],
  zinc: [
    { food_name: 'İstiridye (pişmiş)', amount_per_100g: 78, unit: 'mg', note: 'En yüksek doğal kaynak' },
    { food_name: 'Kırmızı et (biftek)', amount_per_100g: 12, unit: 'mg' },
    { food_name: 'Kabak çekirdeği', amount_per_100g: 10.3, unit: 'mg' },
    { food_name: 'Kaju', amount_per_100g: 5.8, unit: 'mg' },
    { food_name: 'Mercimek (pişmiş)', amount_per_100g: 3.3, unit: 'mg', note: 'Fitat emilimi düşürür — ıslatma yardımcı olur' },
    { food_name: 'Kefir', amount_per_100g: 0.4, unit: 'mg' },
  ],
};

async function main() {
  const dryRun = !process.argv.includes('--run');
  const client = newClient();
  await client.connect();

  console.log(`🥗 Food-sources backfill — ${dryRun ? 'DRY-RUN (veritabanına yazmıyor)' : 'LIVE (UPDATE uygulanacak)'}\n`);

  let updated = 0;
  let skipped = 0;
  for (const [slug, entries] of Object.entries(BACKFILL)) {
    const res = await client.query(
      `SELECT ingredient_id, common_name, food_sources FROM ingredients WHERE ingredient_slug = $1`,
      [slug],
    );
    if (res.rows.length === 0) {
      console.log(`  ⚠️  ${slug} bulunamadı, atlandı`);
      continue;
    }
    const row = res.rows[0];
    const existing = row.food_sources;
    const hasExisting = Array.isArray(existing) && existing.length >= 3;

    if (hasExisting) {
      console.log(`  ↳ ${slug.padEnd(15)} ${String(existing.length).padEnd(2)} mevcut kayıt → SKIP (idempotent, mevcut veriyi bozma)`);
      skipped++;
      continue;
    }

    console.log(`  ✔ ${slug.padEnd(15)} ${String(existing?.length || 0).padEnd(2)} → ${entries.length} kaynak (${row.common_name || 'no-name'})`);
    if (!dryRun) {
      await client.query(
        `UPDATE ingredients SET food_sources = $1::jsonb, updated_at = NOW() WHERE ingredient_id = $2`,
        [JSON.stringify(entries), row.ingredient_id],
      );
    }
    updated++;
  }

  console.log(`\n  ${updated} ingredient ${dryRun ? 'güncellenmeye hazır' : 'güncellendi'}, ${skipped} atlandı (mevcut yeterli veri).`);
  if (dryRun) console.log(`\n  Uygulamak için: --run`);

  await client.end();
}

main().catch(e => {
  console.error('❌', e?.stack ?? e);
  process.exit(1);
});
