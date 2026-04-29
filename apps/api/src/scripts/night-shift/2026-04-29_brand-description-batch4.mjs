/**
 * Faz 2.4 — Brand description batch 4 (top 25 ek mid/small marka).
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
  'lierac': { desc: 'Lierac, Fransa\'nın Laboratoires Pierre Fabre dermokozmetik markası. Lift Integral (lifting), Premium (anti-aging) ve Diopti (göz çevresi) serileri ile yaşlanma karşıtı kategorisinde global. Eczane kanalında konumlanmış.', tagline: 'Eczacının lüks anti-aging seçimi', year: 1975, cats: ['anti-aging', 'lifting', 'göz çevresi', 'eczane'] },
  'nyx': { desc: 'NYX Professional Makeup, 1999\'da ABD\'de kurulan, L\'Oréal grubuna ait makyaj markası. Profesyonel kalitesi + erişilebilir fiyat dengesiyle bilinir. Soft Matte Lip Cream ve Butter Gloss serileri ikonik.', tagline: 'Profesyonel makyaj erişilebilir', year: 1999, cats: ['ruj', 'foundation', 'göz makyajı', 'profesyonel'] },
  'maybelline': { desc: 'Maybelline New York, 1915\'ten beri ABD merkezli ve dünyanın en büyük makyaj markalarından biri. Great Lash maskara, Fit Me foundation ve SuperStay ruj ile pazar lideri. L\'Oréal grubuna bağlı.', tagline: 'Çünkü güzel doğmadın, oldun', year: 1915, cats: ['maskara', 'foundation', 'ruj', 'eyeliner'] },
  'cetaphil': { desc: 'Cetaphil, Galderma\'ya ait Kanadalı dermokozmetik markası. 1947\'de bir hastane formülasyonu olarak başladı, hassas ciltlere yönelik nazik temizleyiciler (Gentle Skin Cleanser) ve nemlendiricilerle dünya çapında dermatolog tavsiyeli.', tagline: 'Hassas cildin için 75 yıl', year: 1947, cats: ['hassas', 'temizleyici', 'nemlendirici', 'atopik'] },
  'burts-bees': { desc: 'Burt\'s Bees, 1984\'te ABD\'de kurulan doğal kişisel bakım markası. Dudak balsamları, bal + arı mumu içerikli ürünler ile bilinir. Clorox grubuna bağlı, B Corp sertifikalı sürdürülebilir marka.', tagline: 'Doğanın sade gücü', year: 1984, cats: ['dudak', 'doğal', 'organik', 'bal'] },
  'rare-beauty': { desc: 'Rare Beauty, 2020\'de Selena Gomez tarafından ABD\'de kurulan inclusive makyaj markası. Soft Pinch Liquid Blush ve Positive Light Tinted Moisturizer ile genç + Z kuşağına yönelik. Mental sağlık vurgulu marketing.', tagline: 'Nadir olan sensin', year: 2020, cats: ['blush', 'tinted', 'inclusive', 'liquid'] },
  'mac': { desc: 'MAC Cosmetics, 1984\'te Toronto\'da makyaj artistleri tarafından kurulan profesyonel makyaj markası. Studio Fix foundation ve Ruby Woo ruj ile global ikonik. Estée Lauder grubuna ait.', tagline: 'Tüm yaş, tüm renk, tüm cinsiyet', year: 1984, cats: ['ruj', 'foundation', 'allık', 'profesyonel'] },
  'muji': { desc: 'Muji (無印良品), 1980\'de Japonya\'da kurulan minimalist yaşam tarzı markası. Cilt bakım hattı (Sensitive Skin serisi) parfümsüz, pH 5.5 dengeli, ekonomik ürünlerle bilinir. Doğal kaynaklı ham maddeler.', tagline: 'Etiketsiz iyi ürün', year: 1980, cats: ['hassas', 'minimal', 'parfümsüz', 'temel'] },
  'heliocare': { desc: 'Heliocare, İspanya\'nın Cantabria Labs grubuna ait güneş koruma markası. Polypodium Leucotomos ekstresi (Fernblock) içeren oral + topikal SPF formülasyonları ile dermatolog tavsiyeli. Hassas ve fotodermatoz hastaları için tercih.', tagline: 'Bilim destekli güneş koruması', year: 1999, cats: ['SPF', 'oral SPF', 'fotodermatoz', 'dermokozmetik'] },
  'dr-hauschka': { desc: 'Dr. Hauschka, 1967\'de Almanya\'da Wala Heilmittel tarafından kurulan biyo-dinamik tarımdan ham madde temin eden organik kozmetik markası. Antroposofik tıp temelli formülasyonlar, ritüelleştirilmiş bakım yaklaşımı.', tagline: 'Doğa ile uyum içinde', year: 1967, cats: ['organik', 'biyo-dinamik', 'doğal', 'antroposofik'] },
  'a-derma': { desc: 'A-Derma, Pierre Fabre Laboratuvarları bünyesindeki Fransız dermokozmetik markası. Yulaf Rhealba (patentli) ile hassas, kuru ve atopik ciltlere odaklı. Exomega serisi atopik dermatitte popüler.', tagline: 'Yulaf Rhealba\'nın gücüyle', year: 1990, cats: ['yulaf', 'atopik', 'hassas', 'dermokozmetik'] },
  'frudia': { desc: 'Frudia, Kore\'nin meyve odaklı (kavun, blueberry, citrus) cilt bakım markası. Brightening, hydrating ve renewal hatları ile genç kitleye yönelik. Doğal meyve ekstresi vurgusu.', tagline: 'Meyveden cildine', year: 2017, cats: ['meyve', 'doğal', 'aydınlatıcı', 'genç'] },
  'centellian24': { desc: 'Centellian24 (Dongkook Pharmaceutical), Kore\'nin Madecasocide odaklı dermokozmetik markası. Madeca 24 Cream ile bariyer onarımı ve hassas cilt yatıştırması. Klinik test destekli.', tagline: 'Madeka\'nın gücü', year: 2018, cats: ['madecassoside', 'cica', 'hassas', 'krem'] },
  'klorane': { desc: 'Klorane, Pierre Fabre Laboratuvarları bünyesindeki Fransız bitkisel saç + cilt bakım markası. Almond, Quinine, Magnolia gibi botanikal hatlar ile eczane kanalında. 1965\'ten beri "doğa + bilim".', tagline: 'Bitkilerin gücüyle', year: 1965, cats: ['saç bakım', 'bitkisel', 'eczane', 'doğal'] },
  'redoxon': { desc: 'Redoxon, Bayer\'in C vitamini odaklı takviye markası. 1934\'te Almanya\'da geliştirilen dünyanın ilk efervesan C vitamini takviyesi. Çinko + D vitamini kombinasyonları ile bağışıklık desteği.', tagline: 'Bağışıklığa güç', year: 1934, cats: ['C vitamini', 'efervesan', 'çinko', 'bağışıklık'] },
  'mustela': { desc: 'Mustela, 1950\'de Fransa\'da kurulan, Laboratoires Expanscience\'a ait bebek + çocuk + hamile bakım markası. Hassas bebek cildine yönelik dermokozmetik formülasyonlar. Avocado Perseose patentli ana aktif.', tagline: 'Bebek için bilim', year: 1950, cats: ['bebek', 'hamile', 'hassas', 'dermokozmetik'] },
  'sebastian': { desc: 'Sebastian Professional, 1974\'te ABD\'de profesyonel saç bakım markası olarak kuruldu. Wella grubu (Coty) bünyesinde. Trilliant ışıltı spreyi ve Whipped Cream köpük ile ikonik.', tagline: 'Profesyonel saç', year: 1974, cats: ['saç bakım', 'profesyonel', 'shampoo', 'styling'] },
  'farmasi': { desc: 'Farmasi, 1950\'de Türkiye\'de kurulan kişisel bakım + makyaj markası. Network marketing kanalı ile genişleyen geniş portföy. Make Up Pro Color, BB cream ve nemlendirici hatları yaygın.', tagline: 'Türkiye\'nin makyajı', year: 1950, cats: ['makyaj', 'kişisel bakım', 'türk markası', 'mass'] },
  'rosense': { desc: 'Rosense, Türkiye\'nin İsparta gül üreticisi Gulbirlik\'in markası. Damask gülünden elde edilen gül suyu ve gül yağı bazlı ürünler. Gül suyu toner Türkiye\'de pazar lideri.', tagline: 'İsparta gülünden', year: 1989, cats: ['gül suyu', 'türk markası', 'doğal', 'toner'] },
  'incia': { desc: 'Incia, Türkiye\'nin clean beauty + minimal cilt bakım markası. Niasinamid + cica + retinol odaklı serumlar ile uygun fiyatlı dermokozmetik segmentinde. The Ordinary tarzı şeffaf formülasyon felsefesi.', tagline: 'Türkiye\'den clean beauty', year: 2020, cats: ['niasinamid', 'serum', 'türk markası', 'clean'] },
  'banobagi': { desc: 'BANOBAGI, Kore\'nin BANOBAGI Plastic Surgery Clinic tarafından kurulan dermokozmetik markası. Cica, vitamin C ve PDRN gibi klinik aktifleri içeren formülasyonlar. Aesthetic medicine + cilt bakım birleşimi.', tagline: 'Kliniğin tercihi', year: 2014, cats: ['klinik', 'cica', 'PDRN', 'profesyonel'] },
  'beauty-of-joseon': { desc: 'Beauty of Joseon, 2010\'da Kore\'de kurulan, geleneksel Joseon dönemi (Kore tarihi 1392-1897) kraliyet bakım ritüellerinden esinlenen marka. Pirinç + ginseng + hanbang ham maddeler. Relief Sun ve Glow Serum ile global popüler.', tagline: 'Kraliyet hanbang ritüeli', year: 2010, cats: ['hanbang', 'pirinç', 'ginseng', 'SPF'] },
  'simyo': { desc: 'Simyo, Türkiye\'nin uygun fiyatlı kişisel bakım markası. Bebek bakım hattı + saç bakım ürünleri ile market kanalında. Bütçe-dostu segment.', tagline: 'Erişilebilir bakım', year: 2010, cats: ['bebek', 'kişisel bakım', 'türk markası', 'mass'] },
  'eveline': { desc: 'Eveline Cosmetics, 1983\'te Polonya\'da kurulan kişisel bakım + makyaj markası. Anti-Cellulite serileri ve C vitamini formülasyonları ile bilinir. Doğu Avrupa pazarında güçlü.', tagline: 'Polonya\'dan bakım', year: 1983, cats: ['anti-selülit', 'C vitamini', 'makyaj', 'doğu avrupa'] },
  'doa': { desc: 'Doa, Türkiye\'nin Türk markaları arasında uygun fiyatlı ev kişisel bakım segmentinde konumlanmış. Şampuan, sabun ve cilt bakım ürünleri ile market kanalında.', tagline: 'Erişilebilir Türk bakımı', year: 2000, cats: ['türk markası', 'mass', 'sabun', 'şampuan'] },
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
    if (r.rowCount && r.rowCount > 0) { updated++; console.log(`OK ${slug}`); }
    else skipped++;
  } catch (e) { console.log(`ERR ${slug}: ${e.message}`); skipped++; }
}
console.log(`\n[2] Updated: ${updated}, Skipped: ${skipped}`);

const final = await c.query(`SELECT COUNT(*) FILTER (WHERE brand_description IS NOT NULL AND length(brand_description) > 50) AS with_desc, COUNT(*) AS total FROM brands WHERE is_active=true`);
console.log(`Total brands with desc: ${final.rows[0].with_desc}/${final.rows[0].total}`);

await c.end();
