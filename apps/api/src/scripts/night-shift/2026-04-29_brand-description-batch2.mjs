/**
 * Faz 2.2 — Top 30 ek marka için manuel TR description seed.
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
  'round-lab': {
    desc: 'Round Lab, Kore çıkışlı dermokozmetik markası. 1025 Dokdo Toner ile dünya çapında popülerlik kazandı; Dokdo Adası deniz suyundan elde edilen formülü hassas ve kuru ciltlere uygun nazik aktifler içeriyor. Birch Juice Moisturizing serisi de temel ürünler arasında.',
    tagline: 'Hassas cildin için K-beauty', year: 2017, cats: ['toner', 'serum', 'nemlendirici', 'SPF'],
  },
  'numbuzin': {
    desc: 'Numbuzin, 2020\'de Kore\'de kurulan minimalist K-beauty markası. Numaralandırılmış ürün serisi (No.1, No.2, No.3...) ile her ürünün spesifik bir cilt sorununa odaklanması felsefesi üzerine kurulu. Yüksek konsantrasyon aktifler ile uygun fiyat dengesini hedefliyor.',
    tagline: 'Numarayla çözüm', year: 2020, cats: ['serum', 'krem', 'temizleyici', 'maske'],
  },
  'skin1004': {
    desc: 'SKIN1004, Kore\'nin Madagaskar Centella Asiatica odaklı markası. Centella ekstresinin %72-100 konsantrasyonlu formülasyonları ile hassas ve reaktif ciltlerde yatıştırıcı etki sağlıyor. Ampoule, krem ve temizleyici hattı geniş, dünya çapında trend marka.',
    tagline: 'Madagaskar Centella ile yatıştırma', year: 2010, cats: ['ampoule', 'centella', 'hassas cilt', 'serum'],
  },
  'etude-house': {
    desc: 'Etude House, 1985\'te Güney Kore\'de kurulan AmorePacific bünyesindeki kozmetik markası. Genç kitleye yönelik renkli ambalajlar, makyaj ve cilt bakım ürünleri ile öne çıkıyor. Türkiye\'de Sephora ve seçili eczanelerde bulunuyor.',
    tagline: 'Eğlenceli K-beauty', year: 1985, cats: ['makyaj', 'temizleyici', 'maske', 'ruj'],
  },
  'murad': {
    desc: 'Murad, 1989\'da dermatolog Howard Murad tarafından ABD\'de kurulan dermokozmetik markası. "Inclusive Health" felsefesiyle topikal bakımın yanında yaşam tarzı yaklaşımını benimsiyor. Vitamin C, retinol ve resurfacing serileri klinik sonuçlarıyla biliniyor.',
    tagline: 'Klinik kanıtlı dermo bakım', year: 1989, cats: ['anti-aging', 'C vitamini', 'retinol', 'akne'],
  },
  'dermalogica': {
    desc: 'Dermalogica, 1986\'da ABD\'de kurulan profesyonel cilt bakım markası. Salon/spa kanalında güçlü konumlanan marka, dermal terapistler tarafından önerilen profesyonel formülasyonlar üretiyor. Daily Microfoliant ve Sound Sleep Cocoon gibi ikonik ürünleri var.',
    tagline: 'Profesyonel cilt bakımı', year: 1986, cats: ['eksfoliyant', 'serum', 'profesyonel', 'eğitim'],
  },
  'sunday-riley': {
    desc: 'Sunday Riley, 2009\'da Texas\'ta kurulan biyokimyasal odaklı premium cilt bakım markası. Good Genes (laktik asit) ve Luna (retinol yağı) ürünleri ile global tanınırlık kazandı. Yüksek konsantrasyon aktif formülasyonlar.',
    tagline: 'Biyokimyasal güç', year: 2009, cats: ['serum', 'retinol', 'AHA', 'glow'],
  },
  'isntree': {
    desc: 'Isntree, Kore\'nin doğal aktif odaklı dermokozmetik markası. Hyaluronik asit serileri (Hyaluronic Acid Toner Plus), TW-Real BHA ve Centella tonik serileri ile bilinir. Hassas ciltlere uygun yumuşak formülasyonlar.',
    tagline: 'Doğal Kore dermokozmetiği', year: 2017, cats: ['toner', 'hyaluronik', 'BHA', 'centella'],
  },
  'medicube': {
    desc: 'Medicube, Kore\'nin LG H&H bünyesindeki dermokozmetik markası. Zero Pore (gözenek) ve Red (kızarıklık) serileri ile akneye eğilimli ve hassas ciltlere odaklanıyor. PDRN (somon DNA) gibi yenilikçi aktifler kullanan marka.',
    tagline: 'Klinik sonuçlu K-derma', year: 2018, cats: ['gözenek', 'kızarıklık', 'PDRN', 'pad'],
  },
  'glow-recipe': {
    desc: 'Glow Recipe, 2014\'te ABD\'de iki Koreli kurucu tarafından başlatılan meyve odaklı cilt bakım markası. Watermelon Glow Niacinamide Dew Drops ve Plum Plump HA ürünleri ile renk-canlılık vurgulu. AROMA ve doğal hisli formülasyonlar.',
    tagline: 'Meyve enerjili glow', year: 2014, cats: ['niacinamide', 'glow', 'meyve', 'serum'],
  },
  'axis-y': {
    desc: 'AXIS-Y, Kore çıkışlı veganist + clean cilt bakım markası. Dark Spot Correcting Serum (LHA + niacinamid) ve Daily Purifying Treatment Toner gibi ürünleri ile hiperpigmentasyon ve sebum dengesi odaklı. Reusable ambalaj felsefesi.',
    tagline: 'Vegan + clean', year: 2019, cats: ['vegan', 'leke', 'niacinamide', 'BHA'],
  },
  'caudalie': {
    desc: 'Caudalie, 1995\'te Fransa\'da Bordeaux bağlarında kurulan üzüm/resveratrol odaklı doğal kozmetik markası. Vinopure (yağlı cilt), Vinoperfect (leke) ve Vinosource (nem) hatları ile global popüler. Çevreci patentli aktifler (resveratrol-glikoz).',
    tagline: 'Bağdan cildine', year: 1995, cats: ['resveratrol', 'doğal', 'leke', 'misel'],
  },
  'benton': {
    desc: 'Benton, Kore\'nin minimalist + doğal odaklı cilt bakım markası. Snail Bee High Content (salyangoz salgısı + propolis) ve Aloe Propolis Soothing Gel gibi yatıştırıcı, hassas cilt ürünleri ile bilinir. Düşük pH, paraben-free.',
    tagline: 'Minimalist Kore', year: 2011, cats: ['salyangoz', 'propolis', 'hassas', 'aloe'],
  },
  'neogen': {
    desc: 'Neogen, Kore\'nin Real Ferment Micro Essence (fermente Lactobacillus) ve Bio-Peel pad (ekzole edici) ile öne çıkan markası. Pad formatlı eksfolyantlar ve fermente esansları ile pazar lideri. Dermalogy alt markasıyla profesyonel hat.',
    tagline: 'Fermentasyon gücü', year: 2000, cats: ['fermente', 'pad', 'AHA/BHA', 'sun'],
  },
  'heimish': {
    desc: 'Heimish, Kore\'nin "evdeki rahatlık" felsefesiyle çıkan minimalist cilt bakım markası. All Clean Balm (temizleme balsamı) ve Bulgarian Rose Water Toner ile bilinir. Doğal ve sade formülasyonlar.',
    tagline: 'Evdeki rahatlık', year: 2015, cats: ['temizleme balsamı', 'gül suyu', 'doğal', 'minimal'],
  },
  'geek-gorgeous': {
    desc: 'Geek & Gorgeous, Macaristan menşeli uygun fiyatlı clean cilt bakım markası. Yüksek konsantrasyon aktifler (B-Bomb niacinamide %15, Hide & Seek SPF, A-Game retinol) ile The Ordinary alternatifi olarak popülerlik kazandı.',
    tagline: 'Bilime dayalı uygun fiyat', year: 2020, cats: ['niacinamide', 'retinol', 'SPF', 'aktif'],
  },
  'loreal-paris': {
    desc: 'L\'Oréal Paris, 1909\'da Fransa\'da kurulan dünyanın en büyük kozmetik gruplarından L\'Oréal grubunun ana markası. Anti-aging, makyaj, saç ve cilt bakım kategorilerinde geniş portföy. Revitalift, Age Perfect serileri global popüler.',
    tagline: 'Çünkü buna değersin', year: 1909, cats: ['anti-aging', 'makyaj', 'saç bakım', 'SPF'],
  },
  'by-wishtrend': {
    desc: 'By Wishtrend, Wishtrend\'in alt markası, klinik düzey aktif odaklı Kore cilt bakımı. Pure Vitamin C 21.5% Advanced Serum ve Mandelic Acid 5% Skin Prep Water ile aktif konsantrasyonu yüksek formülasyonlar sunuyor.',
    tagline: 'Klinik aktif Kore', year: 2014, cats: ['C vitamini', 'AHA', 'aktif', 'serum'],
  },
  'klairs': {
    desc: 'Klairs (Dear, Klairs), Kore\'nin minimalist dermokozmetik markası. Freshly Juiced Vitamin Drop ve Supple Preparation Unscented Toner ile parfümsüz, hassas cilt odaklı. Eksoz emisyonu pH 5.5 düşük formülasyonlar.',
    tagline: 'Hassas cildin için minimalist', year: 2010, cats: ['hassas', 'C vitamini', 'parfümsüz', 'toner'],
  },
  'biore': {
    desc: 'Bioré, Japon Kao şirketinin 1980\'de başlattığı temizlik odaklı kozmetik markası. UV Aqua Rich Watery Essence güneş kremi ile global popülerlik kazandı; gözenek temizleme bantları (Pore Pack) ile bilinir. Bütçe-dostu fiyatlama.',
    tagline: 'Temiz cildin için', year: 1980, cats: ['SPF', 'temizleyici', 'pore', 'sun'],
  },
  'tatcha': {
    desc: 'Tatcha, 2009\'da Vicky Tsai tarafından ABD\'de kurulan Japon-esinli premium cilt bakım markası. The Dewy Skin Cream ve Camellia Cleansing Oil gibi lüks formülasyonları ile bilinir. Geleneksel Japon ritüellerini modern formüllerle birleştirir.',
    tagline: 'Geleneksel Japon güzelliği', year: 2009, cats: ['premium', 'Japon', 'krem', 'oil cleanser'],
  },
  'holika-holika': {
    desc: 'Holika Holika, Kore\'nin renkli ambalajları ve uygun fiyatlı K-beauty hatlarıyla bilinen markası. Aloe 92% Soothing Gel ve Pig-Nose Clear Black Head 3-Step Kit gibi viral ürünleri var.',
    tagline: 'Eğlenceli K-beauty', year: 2010, cats: ['aloe', 'gözenek', 'maske', 'temizleyici'],
  },
  'missha': {
    desc: 'Missha, 2000\'de Kore\'de kurulan, dünyada K-beauty\'nin yayılmasında önemli rol oynayan cilt bakım/makyaj markası. Time Revolution serisi ve M Perfect Cover BB Cream ile global popülerlik kazandı. Uygun fiyat + kalite dengesi.',
    tagline: 'K-beauty\'nin öncüsü', year: 2000, cats: ['BB cream', 'anti-aging', 'maske', 'serum'],
  },
  'uriage': {
    desc: 'Uriage, Fransa\'nın Uriage termal su kaynağına dayanan dermokozmetik markası. Termal Su Spreyi ve Bariederm Cica serisi gibi ürünleri ile hassas ve atopik ciltlere odaklı. Eczane kanalında güçlü konumlanmış.',
    tagline: 'Termal su gücüyle', year: 1992, cats: ['termal su', 'hassas', 'cica', 'bariyer'],
  },
  'nuxe': {
    desc: 'Nuxe, 1989\'da Fransa\'da kurulan doğal odaklı kozmetik markası. Huile Prodigieuse multi-purpose oil ile dünya çapında ikonik. Reve de Miel (bal) ve Crème Fraîche serileri ile besleyici doğal formülasyonlar.',
    tagline: 'Doğal Fransız bakımı', year: 1989, cats: ['vücut yağı', 'bal', 'doğal', 'krem'],
  },
  'innisfree': {
    desc: 'Innisfree, AmorePacific bünyesindeki Kore markası. Jeju Adası volkanik kül, yeşil çay ve diğer doğal hammaddeler temalı hatlar üretiyor. Green Tea Seed Serum ile global popüler.',
    tagline: 'Jeju\'dan doğa', year: 2000, cats: ['yeşil çay', 'volkanik', 'doğal', 'serum'],
  },
  'filorga': {
    desc: 'Filorga, 1978\'de Fransa\'da plastik cerrah Dr. Tournier tarafından kurulan medikal estetik kökenli kozmetik markası. NCEF (mezoterapi formülü) ve Time-Filler serileri ile profesyonel anti-aging odaklı.',
    tagline: 'Medikal estetik kozmetik', year: 1978, cats: ['anti-aging', 'mezoterapi', 'NCTF', 'professional'],
  },
  'purito': {
    desc: 'Purito, Kore\'nin clean beauty odaklı markası. Centella Green Level Buffet Serum ve Sea Buckthorn Vital 70 Cream gibi sade ama etkili formülasyonlar. Vegan + paraben-free + cruelty-free.',
    tagline: 'Saf K-beauty', year: 2010, cats: ['centella', 'vegan', 'serum', 'krem'],
  },
  'simple': {
    desc: 'Simple, Unilever bünyesindeki İngiliz cilt bakım markası. Hassas ciltler için sade, parfümsüz formülasyonlar üretir. 1960\'lardan beri eczane kanalında temel bakım markası olarak konumlanıyor.',
    tagline: 'Hassas cildin için sadelik', year: 1960, cats: ['hassas', 'parfümsüz', 'temel', 'temizleyici'],
  },
  'drunk-elephant': {
    desc: 'Drunk Elephant, 2013\'te ABD\'de kurulan "biocompatible" felsefeli premium cilt bakım markası. T.L.C. Framboos Glycolic Resurfacing Night Serum gibi yüksek konsantrasyon aktifler. "Suspicious 6" (esansiyel yağ, parfüm, alkol vb.) sınırlı.',
    tagline: 'Biocompatible cilt bakımı', year: 2013, cats: ['premium', 'AHA', 'C vitamini', 'biocompatible'],
  },
  'olay': {
    desc: 'Olay, 1952\'de Güney Afrika\'da kurulan, P&G grubuna ait global kozmetik markası. Regenerist serisi (peptide kompleksi) ve Total Effects ile yaşlanma karşıtı kategorisinde liderlik. Erişilebilir fiyat segmenti.',
    tagline: 'Cildin için bilim', year: 1952, cats: ['anti-aging', 'peptide', 'günlük bakım', 'krem'],
  },
};

console.log(`[1] Mapping size: ${Object.keys(BRANDS).length}`);

let updated = 0, skipped = 0;
for (const [slug, data] of Object.entries(BRANDS)) {
  try {
    const r = await c.query(
      `UPDATE brands
       SET brand_description = $2,
           tagline = COALESCE(brands.tagline, $3),
           founded_year = COALESCE(brands.founded_year, $4),
           signature_categories = COALESCE(brands.signature_categories, $5)
       WHERE brand_slug = $1 AND (brand_description IS NULL OR length(brand_description) < 50)`,
      [slug, data.desc, data.tagline, data.year, data.cats]
    );
    if (r.rowCount && r.rowCount > 0) {
      updated++;
      console.log(`OK   [${slug}] ${data.desc.slice(0, 60)}...`);
    } else {
      skipped++;
    }
  } catch (e) {
    console.log(`ERR  [${slug}] ${e.message}`);
    skipped++;
  }
}
console.log(`\n[2] Updated: ${updated}, Skipped: ${skipped}`);

// Final count
const final = await c.query(`SELECT COUNT(*) FILTER (WHERE brand_description IS NOT NULL AND length(brand_description) > 50) AS with_desc, COUNT(*) AS total FROM brands WHERE is_active=true`);
console.log(`Total brands with desc: ${final.rows[0].with_desc}/${final.rows[0].total}`);

await c.end();
