/**
 * Faz F — Brand description batch 6 (kalan 30+ marka final batch).
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
  // Premium / global takviye
  'solgar': { desc: 'Solgar, 1947\'de ABD\'de kurulan, Nestlé Health Science\'a ait premium gıda takviyesi markası. 60+ yıl yüksek kaliteli vitamin, mineral ve özel formülasyonlar üretiyor. GMP sertifikalı, eczane ve sağlık marketi kanalında konumlanmış.', tagline: 'Bilim sağlık için', year: 1947, cats: ['vitamin', 'mineral', 'omega', 'premium takviye'] },
  'newlife': { desc: 'NewLife, Türkiye\'nin Şanlı Holding bünyesindeki gıda takviyesi markası. Multivitamin, kolajen ve özel kombinasyon formülasyonları. Eczane ve büyük market kanallarında geniş dağıtım.', tagline: 'Yeni bir hayat enerjisi', year: 1988, cats: ['multivitamin', 'kolajen', 'türk markası', 'eczane'] },
  'day2day': { desc: 'Day2Day, Türkiye\'nin günlük takviye markası. Kolajen, multivitamin ve omega serileri ile uygun fiyatlı segment. Eczane + online dağıtım.', tagline: 'Her gün enerji', year: 2018, cats: ['kolajen', 'multivit', 'türk markası', 'günlük'] },
  'sudacollagen': { desc: 'SudaCollagen, Türkiye\'nin Suda Vitamin grubuna ait kolajen odaklı takviye markası. Hidrolize Tip I + III kolajen + C vitamini + biotin formülasyonları ile cilt + saç + tırnak segmenti.', tagline: 'Genç kalmak için', year: 2017, cats: ['kolajen', 'cilt', 'türk markası', 'tip I-III'] },
  'unien-pharma': { desc: 'Unien Pharma, Türkiye\'nin gıda takviyesi + dermokozmetik markası. Multivitamin, vitamin C ve özel formülasyonlar ile eczane kanalında. Klinik test destekli ürünler.', tagline: 'Bilim ve sağlık', year: 2010, cats: ['multivit', 'eczane', 'türk markası', 'C vit'] },
  'velavit': { desc: 'Velavit, Türkiye\'nin uygun fiyatlı gıda takviyesi markası. Multivitamin ve mineral formülasyonları. Eczane satış kanalında konumlanmış.', tagline: 'Erişilebilir takviye', year: 2015, cats: ['multivit', 'türk markası', 'eczane', 'mass'] },
  'nbt-life': { desc: 'NBT Life, Türkiye\'nin doğal + bitkisel takviye markası. Bitkisel ekstreler ve özel kombinasyonlar ile niş ürünler. Online satış.', tagline: 'Doğanın bilimi', year: 2018, cats: ['bitkisel', 'türk markası', 'doğal', 'online'] },
  'vitafenix': { desc: 'Vitafenix, Türkiye\'nin gıda takviyesi markası. Vitamin, mineral ve hassas konu (saç, tırnak, eklem) takviyeleri. Eczane kanalında.', tagline: 'Sağlığın gücü', year: 2016, cats: ['vitamin', 'türk markası', 'saç', 'tırnak'] },
  'mediplus': { desc: 'Mediplus, Türkiye\'nin gıda takviyesi + medikal cilt bakım markası. Geniş portföy ile eczane + online satış. Multivitamin + omega-3 + kolajen formülasyonları.', tagline: 'Tıbbi destek', year: 2014, cats: ['takviye', 'türk markası', 'multivit', 'eczane'] },
  'wellcare': { desc: 'Wellcare, Türkiye\'nin gıda takviyesi markası. Multivitamin, omega-3 ve özel kadın formülasyonları ile eczane + online kanal. Klinik test ve kalite vurgusu.', tagline: 'Sağlık iyi yaşamdır', year: 2016, cats: ['takviye', 'multivit', 'türk markası', 'kadın'] },
  'resetify': { desc: 'Resetify, Türkiye\'nin clean beauty + uygun fiyatlı cilt bakım markası. PHA, niasinamid ve hyaluronik asit serumları. Genç kitleye yönelik.', tagline: 'Cildini yenile', year: 2020, cats: ['PHA', 'niasinamid', 'türk markası', 'genç'] },
  'kiperin': { desc: 'Kiperin, Türkiye\'nin yeni nesil aktif odaklı cilt bakım markası. Niasinamid, retinol ve C vitamini içeren uygun fiyatlı serumlar.', tagline: 'Aktif Türk markası', year: 2021, cats: ['serum', 'aktif', 'türk markası', 'mass'] },
  'cream-co': { desc: 'Cream Co., Türkiye\'nin nemlendirici + temel cilt bakım odaklı markası. Hassas + kuru cilt için zengin krem hatları. Online satış.', tagline: 'Krem uzmanı', year: 2019, cats: ['nemlendirici', 'türk markası', 'krem', 'kuru cilt'] },
  'anocin': { desc: 'Anocin, Türkiye\'nin akne + sebum kontrolü odaklı dermokozmetik markası. Salisilik asit ve niasinamid formülasyonları ile genç + yağlı cilt segmenti.', tagline: 'Akne için Türk dermokozmetiği', year: 2017, cats: ['akne', 'türk markası', 'BHA', 'sebum'] },
  'hunca': { desc: 'Hunca, Türkiye\'nin köklü kişisel bakım üreticisi. Sabun, şampuan, deodorant ve cilt bakım ürünleri ile geniş portföy. Türk markası, market kanalında lider.', tagline: 'Türk kalitesinin geleneği', year: 1948, cats: ['sabun', 'şampuan', 'türk markası', 'kişisel bakım'] },
  'sinoz': { desc: 'Sinoz, Türkiye\'nin uygun fiyatlı kozmetik + cilt bakım markası. Vitamin C, niasinamid ve doğal yağlar içeren serumlar. The Ordinary tarzı uygun fiyat segmenti.', tagline: 'Erişilebilir clean beauty', year: 2018, cats: ['serum', 'C vitamini', 'türk markası', 'mass'] },

  // Bebek / çocuk
  'sleepy-baby': { desc: 'Sleepy Baby, Türkiye\'nin Hayat Holding bünyesindeki bebek bakım markası. Bez, ıslak mendil ve cilt bakım ürünleri ile aile pazarında geniş dağıtım. Hassas bebek cildi için dermatolog testli.', tagline: 'Bebek için yumuşak', year: 1995, cats: ['bebek', 'bez', 'mendil', 'türk markası'] },
  'pediatrol': { desc: 'Pediatrol, Türkiye\'nin çocuk takviyesi markası. Yaşa göre formüle edilmiş multivitamin ve mineral ürünler. Eczane kanalında. Pediatrist tavsiyeli.', tagline: 'Çocuk gelişimi için', year: 2015, cats: ['çocuk', 'multivit', 'türk markası', 'eczane'] },
  'chicco': { desc: 'Chicco, 1958\'de İtalya\'da kurulan bebek + çocuk bakım markası. Biberon, oyuncak ve cilt bakım ürünleri ile global. Artsana grubuna ait. Hassas bebek cildi için dermatolog testli.', tagline: 'Bebeğinin yanında', year: 1958, cats: ['bebek', 'biberon', 'oyuncak', 'cilt'] },
  'molfix': { desc: 'Molfix, Türkiye\'nin Hayat Holding bünyesindeki bebek bezi markası. Sleepy Baby gibi aile pazarında lider. Süper emici teknoloji ve hassas cilt formülasyonu.', tagline: 'Bebek için kuru rahatlık', year: 1991, cats: ['bebek', 'bez', 'türk markası', 'mass'] },
  'johnsons-baby': { desc: 'Johnson\'s Baby, 1894\'te ABD\'de kurulan, Johnson & Johnson grubunun bebek bakım markası. Bebek şampuanı, krem ve mendil hatları ile global. "No more tears" formülü ikonik.', tagline: '125+ yıl bebek bakımı', year: 1894, cats: ['bebek', 'şampuan', 'krem', 'mass'] },

  // Saç bakım
  'pantene': { desc: 'Pantene, 1947\'de İsviçre\'de geliştirilen, P&G grubuna ait şampuan + saç bakım markası. Pro-V (Pantenol) formülü ile global pazar lideri. Hasarlı saç + onarım hatları.', tagline: 'Güçlü, parlak saç', year: 1947, cats: ['saç bakım', 'şampuan', 'pantenol', 'mass'] },
  'head-and-shoulders': { desc: 'Head & Shoulders, 1961\'de ABD\'de kurulan, P&G grubuna ait kepeklenme + saç bakım markası. Pyrithione zinc aktif maddesi ile dünya çapında kepeklenme tedavisi pazar lideri.', tagline: 'Kepeksiz güven', year: 1961, cats: ['kepeklenme', 'şampuan', 'pyrithione zinc', 'mass'] },
  'elseve': { desc: 'Elseve (L\'Oréal Paris), 1958\'de Fransa\'da geliştirilen, L\'Oréal grubunun saç bakım hattı. Total Repair, Color Vive, Hyaluronic Acid serileri ile geniş portföy. Eczane + market kanalında.', tagline: 'Saçınız hak ettiği bakım', year: 1958, cats: ['saç bakım', 'şampuan', 'maske', 'L\'Oréal'] },
  'dercos': { desc: 'Dercos (Vichy), Vichy markasının saç bakım alt hattı. Mineral 89 saç versiyonu, kepeklenme ve saç dökülmesi serileri ile dermatolog tavsiyeli profesyonel saç bakım.', tagline: 'Vichy kalitesi saç için', year: 1990, cats: ['saç bakım', 'kepeklenme', 'saç dökülmesi', 'dermatolog'] },
  'bioxcin': { desc: 'Bioxcin, Türkiye\'nin İlko İlaç bünyesindeki saç bakım markası. Saç dökülmesi, kepeklenme ve saç onarımı için bitkisel + aktif kombinasyonlar. Eczane kanalında.', tagline: 'Saç sağlığı bilimi', year: 2010, cats: ['saç bakım', 'türk markası', 'kepeklenme', 'eczane'] },

  // Kozmetik diğer
  'sephora-collection': { desc: 'Sephora Collection, Sephora\'nın kendi private label markası. Makyaj + cilt bakım + parfüm hatları ile mağaza özel ürünler. Premium algı + uygun fiyat.', tagline: 'Sephora\'dan size', year: 1969, cats: ['makyaj', 'cilt bakım', 'parfüm', 'private label'] },
  'naturium': { desc: 'Naturium, 2019\'da ABD\'de kurulan clean beauty + uygun fiyatlı cilt bakım markası. Niasinamid 12% Plus Zinc 2%, Tranexamic Topical Acid 5% gibi yüksek konsantrasyon aktif serumlar. The Ordinary alternatifi.', tagline: 'Kanıt-temelli temiz', year: 2019, cats: ['niasinamid', 'aktif', 'clean', 'serum'] },
  'byoma': { desc: 'Byoma, 2022\'de ABD\'de kurulan bariyer + ceramide odaklı genç markası. Tri-Ceramide Complex temel aktif. Pastel renkli geri dönüşümlü ambalaj. Sephora\'da yaygın.', tagline: 'Bariyer için tasarlandı', year: 2022, cats: ['ceramide', 'bariyer', 'genç', 'sürdürülebilir'] },
  'yves-rocher': { desc: 'Yves Rocher, 1959\'da Fransa\'da kurulan botanik kozmetik markası. Kendi botanik araştırma laboratuvarı + üretim tesislerinde organik bitkilerden ürün üretir. Plante Botanique konsepti.', tagline: 'Botanik güzellik', year: 1959, cats: ['botanik', 'organik', 'fransız', 'doğal'] },

  // Yunan / Diğer
  'bioten': { desc: 'Bioten, Yunanistan\'ın Sarantis grubuna ait dermokozmetik markası. Doğal aktifler ve hassas cilt formülasyonları ile Avrupa ve Türkiye pazarında konumlanmış. Uygun fiyat + kalite.', tagline: 'Yunan dermokozmetiği', year: 1990, cats: ['hassas', 'doğal', 'eczane', 'yunan'] },
  'isana': { desc: 'Isana, Almanya\'nın Rossmann zinciri private label markası. Cilt bakım, saç bakım ve makyaj hatları ile uygun fiyat segmenti. Dermatolog testli.', tagline: 'Erişilebilir Alman bakımı', year: 1990, cats: ['private label', 'mass', 'temel bakım', 'rossmann'] },
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
    if (r.rowCount && r.rowCount > 0) updated++;
    else skipped++;
  } catch (e) { skipped++; }
}
console.log(`[2] Updated: ${updated}, Skipped: ${skipped}`);

const final = await c.query(`SELECT COUNT(*) FILTER (WHERE brand_description IS NOT NULL AND length(brand_description) > 50) AS with_desc, COUNT(*) AS total FROM brands WHERE is_active=true`);
console.log(`Total brands with desc: ${final.rows[0].with_desc}/${final.rows[0].total}`);

await c.end();
