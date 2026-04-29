/**
 * Faz 6 — Brand description final batch (kalan 18 marka).
 * Hedef: 163/181 → 181/181 (%100).
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const BRANDS = {
  // Kore (8)
  'anua': { desc: 'Anua, Kore\'nin Heartleaf (Houttuynia cordata) odaklı dermokozmetik markası. Heartleaf 77% Soothing Toner ve Cleansing Oil ile global popülerlik kazandı. Hassas + akneli ciltlere yönelik clean beauty.', tagline: 'Heartleaf\'in gücü', year: 2018, cats: ['heartleaf', 'temizleyici', 'toner', 'hassas'] },
  'cosrx': { desc: 'COSRX, 2014\'te Kore\'de kurulan minimalist dermokozmetik markası. Salyangoz salgısı (Snail Mucin Power Essence), BHA Power Liquid ve Acne Pimple Master Patch ile global K-beauty pazar lideri. "Kozmetik + RX" felsefesi.', tagline: 'Klinik basitliği', year: 2014, cats: ['snail', 'BHA', 'acne patch', 'minimal'] },
  'dr-jart': { desc: 'Dr. Jart+, 2005\'te Kore\'de dermatologlar tarafından kurulan dermokozmetik markası. Cicapair (Tiger Grass) ve Ceramidin serileri ile bilinir. Estée Lauder grubuna ait. BB cream pazarının öncülerinden.', tagline: 'Dermatolog formülasyonu', year: 2005, cats: ['cicapair', 'ceramidin', 'BB cream', 'klinik'] },
  'iunik': { desc: 'IUNIK, Kore\'nin clean beauty + uygun fiyatlı vegan dermokozmetik markası. Black Snail Restore Cream ve Beta Glucan Power Moisture Serum ile niş popüler. Hayvansal-free ve paraben-free formülasyonlar.', tagline: 'Vegan K-beauty', year: 2017, cats: ['vegan', 'beta glucan', 'snail', 'serum'] },
  'laneige': { desc: 'LANEIGE, AmorePacific bünyesindeki Kore\'nin premium hidrasyon odaklı markası. Water Sleeping Mask, Lip Sleeping Mask ve Cream Skin Toner & Moisturizer ile global ikonik. Yoğun nem teknolojisi.', tagline: 'Hidrasyonun yıldızı', year: 1994, cats: ['sleeping mask', 'hidrasyon', 'lip mask', 'premium K'] },
  'some-by-mi': { desc: 'Some By Mi, Kore\'nin AHA-BHA-PHA 30 Days Miracle serileri ile tanınan dermokozmetik markası. Akne ve gözenek kontrolü odaklı uygun fiyat segmenti. Yuja Niacin ve Snail Truecica hatları popüler.', tagline: '30 günde mucize', year: 2017, cats: ['AHA-BHA-PHA', 'akne', 'cica', 'serum'] },
  'torriden': { desc: 'Torriden, Kore\'nin Dive-In low-molecular hyaluronik asit serileri ile bilinen markası. Multi-weight HA + 5-CICA serisi ile hidrasyon ve bariyer odaklı. Hassas + dehidre cilt için tercih.', tagline: 'Multi-weight HA ustası', year: 2018, cats: ['HA', 'cica', 'serum', 'toner'] },

  // ABD (5)
  'cerave-tr': { desc: 'CeraVe (Türkiye), L\'Oréal grubuna ait Amerikan dermokozmetik markasının Türkiye distribütörü. Ceramide + hyaluronik asit içerikli bariyer onarıcı formüller. Dermatolog tavsiyeli, eczane kanalında yaygın.', tagline: 'Dermatologların tercihi', year: 2005, cats: ['ceramide', 'bariyer', 'hassas', 'eczane'] },
  'estee-lauder': { desc: 'Estée Lauder, 1946\'da ABD\'de kurulan global premium kozmetik markası. Advanced Night Repair serum ile anti-aging segmentinin lideri. The Estée Lauder Companies grubunun amiral markası.', tagline: 'Lüksün altın standardı', year: 1946, cats: ['premium', 'anti-aging', 'serum', 'foundation'] },
  'fenty-beauty': { desc: 'Fenty Beauty, 2017\'de Rihanna tarafından kurulan inclusive makyaj markası. 50 ton Pro Filt\'r foundation ile makyaj sektörünü dönüştürdü ("Fenty Effect"). LVMH grubuna ait. Clean + cruelty-free.', tagline: 'Beauty for all', year: 2017, cats: ['inclusive', 'foundation', 'ruj', 'highlighter'] },
  'neutrogena': { desc: 'Neutrogena, 1930\'da ABD\'de kurulan dermatolog tavsiyeli temizleyici + güneş bakım markası. Hydro Boost ve Ultra Sheer SPF serileri ile global. Johnson & Johnson grubuna ait.', tagline: 'Sağlıklı görünen cilt', year: 1930, cats: ['SPF', 'hyaluronik', 'temizleyici', 'mass'] },
  'paulas-choice': { desc: 'Paula\'s Choice, Paula Begoun tarafından 1995\'te ABD\'de kurulan kanıt-temelli dermokozmetik markası. 2% BHA Liquid ve 10% Niacinamide Booster ile aktif odaklı segment. Şeffaf bileşen listesi felsefesi.', tagline: 'Kanıta dayalı bakım', year: 1995, cats: ['BHA', 'niacinamide', 'retinol', 'şeffaf'] },

  // Fransa (3)
  'garnier': { desc: 'Garnier, 1904\'te Fransa\'da kurulan, L\'Oréal grubuna ait kişisel bakım + saç bakım markası. Mikrobiyom dostu Bio + Skin Active serileri ile niş + mass arası konumlanmış. Sürdürülebilir paketleme vurgusu.', tagline: 'Doğal güzellik', year: 1904, cats: ['saç bakım', 'cilt bakım', 'mass', 'doğal'] },
  'isis-pharma': { desc: 'ISIS Pharma, Fransa\'nın dermokozmetik markası. Akne, leke ve hassas cilt için klinik formülasyonlar. Eczane kanalında konumlanmış. Klinik test destekli ve dermatolog tavsiyeli ürünler.', tagline: 'Klinik dermokozmetik', year: 1990, cats: ['akne', 'leke', 'hassas', 'eczane'] },
  'nuxe-tr': { desc: 'Nuxe (Türkiye), 1989\'da Fransa\'da kurulan doğal odaklı kozmetik markasının Türkiye distribütörü. Huile Prodigieuse multi-purpose oil ve Reve de Miel (bal) serileri ile besleyici doğal formülasyonlar.', tagline: 'Doğal Fransız bakımı', year: 1989, cats: ['vücut yağı', 'bal', 'doğal', 'krem'] },

  // Yunan (1)
  'apivita': { desc: 'Apivita, 1979\'da Yunanistan\'da arı ürünleri (bal + propolis) odaklı doğal kozmetik markası. Yunan flora ekstreleri ile sürdürülebilir formülasyonlar. Eczane + niş market kanalında.', tagline: 'Yunan doğasından', year: 1979, cats: ['bal', 'propolis', 'doğal', 'organik'] },

  // Türkiye (1)
  'cosmed': { desc: 'Cosmed, Türkiye\'nin uygun fiyatlı kişisel bakım + makyaj markası. Geniş portföy ile market kanalında. Türk markası, mass-market segmentinde konumlanmış.', tagline: 'Erişilebilir Türk bakımı', year: 2000, cats: ['makyaj', 'mass', 'türk markası', 'kişisel bakım'] },
  'dermoskin': { desc: 'Dermoskin, Türkiye\'nin dermokozmetik markası. Cilt bakım + saç bakım hatları ile eczane kanalında konumlanmış. Niasinamid, salisilik asit ve C vitamini odaklı klinik aktifler.', tagline: 'Türkiye\'nin dermokozmetiği', year: 2010, cats: ['niasinamid', 'salisilik', 'C vit', 'türk markası'] },
};

console.log(`[1] Mapping size: ${Object.keys(BRANDS).length}`);
let updated = 0, skipped = 0;
for (const [slug, data] of Object.entries(BRANDS)) {
  try {
    const r = await c.query(
      `UPDATE brands SET brand_description=$2, tagline=COALESCE(brands.tagline,$3), founded_year=COALESCE(brands.founded_year,$4), signature_categories=COALESCE(brands.signature_categories,$5)
       WHERE brand_slug=$1 AND (brand_description IS NULL OR length(brand_description) < 50)`,
      [slug, data.desc, data.tagline, data.year, data.cats]
    );
    if (r.rowCount && r.rowCount > 0) updated++;
    else skipped++;
  } catch (e) { skipped++; console.log(`ERR ${slug}: ${e.message}`); }
}
console.log(`[2] Updated: ${updated}, Skipped: ${skipped}`);
const final = await c.query(`SELECT COUNT(*) FILTER (WHERE brand_description IS NOT NULL AND length(brand_description) > 50) AS w FROM brands WHERE is_active=true`);
console.log(`Total brands w/ desc: ${final.rows[0].w}/181`);
await c.end();
