/**
 * Faz 2.3 — Top 30 ek marka için manuel TR description (batch 3).
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
  'senka': { desc: 'Senka, Shiseido grubunun ekonomik segmentteki Japon cilt bakım markası. Perfect Whip yüz temizleme köpüğü ile global popüler — yumuşak köpük + ipek protein içeriği. Bütçe-dostu Japon kalite.', tagline: 'İpek yumuşaklığında Japon temizliği', year: 2003, cats: ['temizleyici', 'köpük', 'whip', 'ipek protein'] },
  'melano-cc': { desc: 'Melano CC (Rohto Pharmaceutical), Japon eczane kanalının leke ve hiperpigmentasyon odaklı markası. Premium Whitening Essence (saf C vitamini + E vitamini) ürünüyle bilinir. Eski lekelere ve C vitamini stabilizasyonu üzerine teknik formülasyonlar.', tagline: 'Lekeleri hedef alan saf C', year: 2007, cats: ['C vitamini', 'leke', 'whitening', 'serum'] },
  'the-body-shop': { desc: 'The Body Shop, 1976\'da İngiltere\'de Anita Roddick tarafından kurulan etik kozmetik öncüsü. Hayvan testine karşı, fair-trade ham madde kaynaklı. Tea Tree, Vitamin E, Drops of Youth gibi ikonik serileri var. Sürdürülebilir paketleme felsefesi.', tagline: 'Etik güzellik 1976\'dan beri', year: 1976, cats: ['etik', 'çay ağacı', 'fair-trade', 'sürdürülebilir'] },
  'aveeno': { desc: 'Aveeno, Johnson & Johnson bünyesindeki Amerikan dermokozmetik markası. Yulaf (kolloid yulaf ezmesi) bazlı formülasyonlar ile hassas, kuru ve atopik ciltlere yönelik. Calm + Restore ve Skin Relief serileri öne çıkar.', tagline: 'Yulafın doğal gücüyle', year: 1945, cats: ['yulaf', 'atopik', 'hassas', 'eczema'] },
  'svr': { desc: 'SVR, Fransa\'nın eczane kanalında güçlü konumlanan dermokozmetik markası. Sebiaclear (akne) ve Hydraliane (nem) serileri ile bilinir. C20 saf C vitamini ve klinik test destekli ürünler.', tagline: 'Klinik dermokozmetik', year: 1962, cats: ['akne', 'C vitamini', 'nem', 'eczane'] },
  'pyunkang-yul': { desc: 'Pyunkang Yul, Kore\'nin Pyunkang Korean Medicine Hospital tarafından 2009\'da çıkarılan minimalist dermokozmetik markası. Essence Toner (Astragalus özlü) ile parfümsüz, hassas cilt odaklı. Süper minimal bileşen listesi felsefesi.', tagline: 'Geleneksel Kore tıbbı + cilt bakımı', year: 2009, cats: ['minimal', 'astragalus', 'hassas', 'toner'] },
  'sebamed': { desc: 'Sebamed, 1957\'de Almanya\'da kurulan, cildin doğal pH 5.5\'ine uygun formülasyonlarla bilinen dermokozmetik markası. Liquid Face & Body Wash ve Anti-Dry serisi ile dünyada eczane markası olarak konumlanmış.', tagline: 'pH 5.5 cildine en yakın', year: 1957, cats: ['pH 5.5', 'temizleyici', 'hassas', 'bebek'] },
  'ducray': { desc: 'Ducray, Pierre Fabre Laboratuvarları bünyesindeki Fransız dermokozmetik markası. Saç sağlığı (Anaphase, Anacaps), egzama ve seboreik dermatit serileriyle eczane kanalında güçlü. 80 yılı aşkın klinik deneyim.', tagline: 'Saç ve cilt için Fransız bilimi', year: 1930, cats: ['saç bakım', 'kepeklenme', 'egzama', 'dermokozmetik'] },
  'revolution': { desc: 'Revolution Beauty, 2014\'te İngiltere\'de kurulan uygun fiyatlı kozmetik markası. Skincare ve Makeup hatları ile zoomer/genç kitleye odaklı. Niacinamide 5%, Retinol 0.3% gibi aktif odaklı uygun fiyatlı serumlar.', tagline: 'Devrim niteliğinde uygun fiyat', year: 2014, cats: ['niacinamide', 'retinol', 'makyaj', 'genç'] },
  'fresh': { desc: 'Fresh, 1991\'de ABD\'de kurulan ama Fransa kökenli premium cilt bakım markası. Soya, kara şeker ve gül su gibi doğal aktiflerle Black Tea ve Rose serileri ile bilinir. LVMH grubuna bağlı.', tagline: 'Doğal premium bakım', year: 1991, cats: ['premium', 'doğal', 'gül', 'soya'] },
  'procsin': { desc: 'Procsin, Türk dermokozmetik markası — gluconolactone (PHA), bakuchiol ve diğer aktif odaklı formülasyonlar üretir. PHA Mist ve DNA-Retinol serileri ile uygun fiyat + aktif konsantrasyon dengesi.', tagline: 'Türkiye\'den dermokozmetik', year: 2018, cats: ['PHA', 'bakuchiol', 'retinol', 'aktif'] },
  'hada-labo': { desc: 'Hada Labo, Rohto Pharmaceutical\'ın Japon HA odaklı markası. Gokujyun Premium Hyaluronic Acid Lotion ile multi-weight HA pazarına öncülük etti. Minimalist Japonca formülasyon felsefesi.', tagline: 'Hyalüronik asit ustası', year: 2004, cats: ['hyaluronic', 'lotion', 'minimal', 'Japon'] },
  'noreva': { desc: 'Noreva, Fransa\'nın Laboratoires Bailleul-Biorga grubuna ait dermokozmetik markası. Exfoliac (akne), Sensidiane (hassas) ve Iklen (leke) serileri ile eczane kanalında konumlanmış. Klinik destekli formülasyonlar.', tagline: 'Eczanenin dermokozmetiği', year: 1924, cats: ['akne', 'leke', 'hassas', 'eczane'] },
  'mizon': { desc: 'Mizon, 2009\'da Kore\'de kurulan salyangoz salgısı (snail mucin) odaklı K-beauty markası. All In One Snail Repair Cream ile global popülerlik kazandı. Hassas ve onarım odaklı formüller.', tagline: 'Salyangoz mucin gücü', year: 2009, cats: ['salyangoz', 'snail mucin', 'onarım', 'krem'] },
  'peter-thomas-roth': { desc: 'Peter Thomas Roth, 1993\'te ABD\'de Peter Thomas Roth tarafından kurulan klinik kozmetik markası. Macy\'s ve Sephora\'da güçlü konumlanan marka, profesyonel düzeyde aktif konsantrasyonlar (24K Gold Mask, FIRMx, Pumpkin Enzyme) sunar.', tagline: 'Klinik kalite kozmetik', year: 1993, cats: ['profesyonel', 'aktif', 'maske', 'enzyme'] },
  'weleda': { desc: 'Weleda, 1921\'de İsviçre\'de Rudolf Steiner tarafından antroposofik tıp temelli kurulmuş doğal kozmetik markası. Skin Food ve Almond serileri ile minimalist + organik felsefe. NATRUE sertifikalı.', tagline: 'Antroposofik doğal bakım', year: 1921, cats: ['organik', 'doğal', 'krem', 'antroposofik'] },
  'farmacy': { desc: 'Farmacy, 2015\'te ABD\'de kurulan tarım-temelli "farm-to-face" kozmetik markası. Honey Halo, Green Clean (cleansing balm) ve Skinscape serileri ile organik propolis, bal ve bitki ekstrelerini ön plana çıkarır.', tagline: 'Çiftlikten cildine', year: 2015, cats: ['organik', 'bal', 'temizleme balsamı', 'doğal'] },
  'illiyoon': { desc: 'Illiyoon, AmorePacific bünyesindeki Kore\'nin atopik ve kuru cilt odaklı markası. Ceramide Ato Concentrate Cream ile bariyer onarımı, parfümsüz formülasyonlar. Hassas bebek ve aile hattı.', tagline: 'Tüm aile için yatıştırma', year: 2010, cats: ['ceramide', 'atopik', 'bebek', 'parfümsüz'] },
  'charlotte-tilbury': { desc: 'Charlotte Tilbury, 2013\'te İngiliz makyaj sanatçısı Charlotte Tilbury tarafından kurulan premium makyaj + cilt bakım markası. Magic Cream ve Pillow Talk ruj/blush serileri ikonik. Hollywood + LVMH konumlanması.', tagline: 'Sihirli güzellik', year: 2013, cats: ['makyaj', 'krem', 'ruj', 'premium'] },
  'embryolisse': { desc: 'Embryolisse, 1950\'de Fransa\'da bir hastane formülasyonu olarak ortaya çıkan dermokozmetik markası. Lait-Crème Concentré ürünüyle dünyada makyaj artistleri arasında popüler. Bütçe-dostu Fransız klasik.', tagline: 'Artistlerin tercihi', year: 1950, cats: ['Fransız', 'krem', 'multifonksiyon', 'makeup base'] },
  'banila-co': { desc: 'Banila Co, Kore\'nin Clean It Zero balsam temizleyicileri ile bilinen makyaj + cilt bakım markası. F&F Beauty grubuna ait. Hot Pink Berry, Original ve Resveratrol versiyonları K-beauty\'nin ikonik temizleme balsamlarından.', tagline: 'Temizleme balsamı pazarının lideri', year: 2005, cats: ['cleansing balm', 'temizleyici', 'makyaj', 'K-beauty'] },
  'sulwhasoo': { desc: 'Sulwhasoo, AmorePacific bünyesindeki Kore\'nin premium hanbang (geleneksel Kore tıbbı) kozmetik markası. First Care Activating Serum ve Concentrated Ginseng Renewing Cream ile lüks anti-aging segmentinde global tanınır.', tagline: 'Hanbang lüksü', year: 1966, cats: ['premium', 'ginseng', 'anti-aging', 'hanbang'] },
  'kiehls': { desc: 'Kiehl\'s, 1851\'de New York\'ta apotekri olarak kurulan klasik Amerikan kozmetik markası. Calendula Toner, Midnight Recovery Concentrate, Ultra Facial Cream ile dünya çapında ikonik. L\'Oréal grubuna bağlı.', tagline: 'Apotekarya kökenli klasik', year: 1851, cats: ['klasik', 'calendula', 'multifonksiyon', 'krem'] },
  'rilastil': { desc: 'Rilastil, IBSA Farmaceutici grubunun İtalyan dermokozmetik markası. Hidrojeneratör HA, Multirepair (anti-aging) ve sun protection serileri ile eczane kanalında konumlanmış. Klinik test destekli.', tagline: 'İtalyan dermokozmetiği', year: 1973, cats: ['eczane', 'HA', 'SPF', 'anti-aging'] },
  'acm': { desc: 'ACM Laboratoire Dermatologique, Fransa\'nın Pierre Fabre grubuna ait dermokozmetik markası. Depiwhite (leke), Sebionex (akne) ve Sebium serileri ile eczane kanalında. Klinik test + dermatolog tavsiyesi odaklı.', tagline: 'Fransız dermo eczanesi', year: 1990, cats: ['leke', 'akne', 'sebum', 'eczane'] },
  'dove': { desc: 'Dove, Unilever grubunun 1957\'de ABD\'de başlattığı kişisel bakım markası. Beauty Bar (1/4 nemlendirici), Real Beauty kampanyaları ile global. Cilt + saç + vücut bakım kategorilerinde geniş portföy. Bütçe-dostu mass-market.', tagline: 'Gerçek güzellik için', year: 1957, cats: ['vücut bakım', 'saç bakım', 'temizleyici', 'mass'] },
  'tonymoly': { desc: 'TonyMoly, 2006\'da Kore\'de kurulan eğlenceli ambalajlı K-beauty markası. Panda\'s Dream gözaltı, I\'m Real maske serileri ile genç kitleye odaklı. Innisfree benzeri uygun fiyat segmenti.', tagline: 'Eğlence + kalite', year: 2006, cats: ['maske', 'BB cream', 'genç', 'K-beauty'] },
  'sk-ii': { desc: 'SK-II, P&G grubunun Japon premium anti-aging markası. Pitera (galactomyces fermentinin ilk fonksiyonel maya türevi) ile Facial Treatment Essence ürünü ikonik. Global lüks segmentte konumlanmış.', tagline: 'Pitera\'nın gücüyle', year: 1980, cats: ['premium', 'pitera', 'anti-aging', 'essence'] },
  'skinceuticals': { desc: 'SkinCeuticals, ABD\'de dermatolog Sheldon Pinnell tarafından geliştirilen klinik anti-aging markası. C E F Serum (saf C vitamini + E + ferulik asit) ile photoprotection alanında lider. L\'Oréal grubuna bağlı.', tagline: 'Klinik kanıt + dermatolog', year: 1997, cats: ['premium', 'C vitamini', 'antioksidan', 'klinik'] },
  'altruist': { desc: 'Altruist, dermatolog Andrew Birnie tarafından İngiltere\'de uygun fiyatlı SPF olarak kurulmuş — dünyada cilt kanseri farkındalığı misyonu. Geniş spektrum SPF 50 sun krem ürünleri ile global.', tagline: 'Dermatolog kalitesi, uygun fiyat', year: 2016, cats: ['SPF', 'sun', 'dermatolog', 'misyon'] },
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
