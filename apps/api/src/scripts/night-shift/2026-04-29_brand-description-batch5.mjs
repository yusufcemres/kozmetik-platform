/**
 * Faz 2.5 — Brand description batch 5 (35 ek marka — TR + DE + diğerler).
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
  // Almanya
  'essence': { desc: 'essence cosmetics, 2002\'de Almanya\'da Cosnova grubu tarafından kurulan ekonomik makyaj markası. Genç kitleye yönelik trend ürünler ve uygun fiyatlama. Cruelty-free + vegan formülasyon vurgusu.', tagline: 'Trend takip et, bütçe koru', year: 2002, cats: ['makyaj', 'ruj', 'oje', 'mass'] },
  'catrice': { desc: 'Catrice Cosmetics, Cosnova grubunun 2004\'te Almanya\'da çıkardığı ekonomik makyaj markası. essence\'tan biraz daha yüksek segmentte konumlanmış, daha geniş renk paleti. Vegan + cruelty-free.', tagline: 'Erişilebilir lüks', year: 2004, cats: ['makyaj', 'liner', 'foundation', 'mass'] },
  'bepanthen': { desc: 'Bepanthen, Bayer\'in 1944\'ten beri ürettiği panthenol (Provitamin B5) odaklı dermokozmetik markası. Bebek diaper rash kremi ve yaralı/tahrişli cilt bakımı kategorisinde global lider. Eczane kanalında.', tagline: 'Cildin onarıcısı', year: 1944, cats: ['panthenol', 'bebek', 'yara bakım', 'eczane'] },
  'hipp': { desc: 'Hipp, 1932\'de Almanya\'da kurulan organik bebek beslenmesi + bakım markası. EU organic sertifikalı bebek mamaları ve Babysanft cilt bakım hattı ile bilinir. Hassas bebek cildi için parfümsüz formülasyonlar.', tagline: 'Organik bebek bakımı', year: 1932, cats: ['bebek', 'organik', 'mama', 'hassas'] },
  'nuk': { desc: 'NUK, 1956\'da Almanya\'da kurulan, Mapa GmbH\'a ait bebek bakım + emzirme ürünleri markası. Dünyanın en yaygın biberon ve emzik markalarından. Doktor önerili.', tagline: 'Bebek için doğal', year: 1956, cats: ['bebek', 'emzirme', 'biberon', 'emzik'] },
  'supradyn': { desc: 'Supradyn, Bayer\'in 1956\'da çıkardığı multivitamin markası. Yetişkin enerji + bağışıklık desteği için Energy ve Boost serileri ile global. Efervesan tablet formatında pazar lideri.', tagline: 'Enerjini yenile', year: 1956, cats: ['multivitamin', 'efervesan', 'enerji', 'B-kompleks'] },
  'wella': { desc: 'Wella Professionals, 1880\'de Almanya\'da kurulan profesyonel saç bakım markası. Koleston Perfect saç boyası ve EIMI styling hattı ile dünya çapında salonların tercihi. Coty grubuna bağlı.', tagline: 'Profesyonel saç', year: 1880, cats: ['saç bakım', 'profesyonel', 'boya', 'styling'] },
  'schwarzkopf': { desc: 'Schwarzkopf Professional, 1898\'de Almanya\'da kurulan saç bakım + boya markası. Henkel grubuna ait. Igora boya, BC Bonacure ve OSiS+ styling hatları ile salonlarda tercih.', tagline: '125+ yıl saç uzmanlığı', year: 1898, cats: ['saç bakım', 'boya', 'profesyonel', 'styling'] },

  // Japonya
  'canmake': { desc: 'Canmake, Japonya\'nın IDA Laboratories\'ı tarafından üretilen genç + kawaii estetik makyaj markası. Marshmallow Finish Powder ve Cream Cheek ürünleri ile Japonya genç kuşak pazar lideri. Uygun fiyat.', tagline: 'Kawaii makeup', year: 1985, cats: ['makyaj', 'allık', 'pudra', 'mass'] },

  // Türkiye
  'bebak': { desc: 'Bebak, Türkiye\'nin İstanbul\'da kurulan dermokozmetik markası. Limon Kolonyası ve cilt onarıcı ürünleri ile uzun yıllardır eczanelerde. Hassas cilt + post-prosedür segmenti.', tagline: 'Türk dermokozmetiği', year: 1950, cats: ['kolonya', 'antiseptik', 'türk markası', 'eczane'] },
  'siveno': { desc: 'Siveno, Türkiye\'nin clean beauty + organik kozmetik markası. Bitkisel ekstreler ve organik yağlar ile minimum bileşen formülasyonları. Sürdürülebilir paketleme.', tagline: 'Sade + organik', year: 2018, cats: ['organik', 'doğal', 'türk markası', 'clean'] },
  'vitaceel': { desc: 'Vitaceel, Türkiye\'nin tıbbi cilt bakım markası. Niasinamid, Centella ve C vitamini odaklı dermokozmetik formülasyonlar. Eczane kanalında uygun fiyat.', tagline: 'Klinik bakım, uygun fiyat', year: 2015, cats: ['niasinamid', 'cica', 'türk markası', 'eczane'] },
  'dynavit': { desc: 'Dynavit, Türkiye\'nin Abdi İbrahim grubuna ait gıda takviyesi markası. Multi vitamin Energy, Junior ve Active serileri ile geniş yaş aralığında konumlanmış. Eczane satış kanalında güçlü.', tagline: 'Enerji ve sağlık', year: 2010, cats: ['multivitamin', 'enerji', 'türk markası', 'eczane'] },
  'thalia': { desc: 'Thalia, Türkiye\'nin Procsin grubu bünyesindeki cilt bakım markası. Vitamin C + AHA + niasinamid odaklı uygun fiyatlı serumlar. Genç kitleye yönelik clean beauty.', tagline: 'Türk clean beauty', year: 2019, cats: ['serum', 'C vitamini', 'türk markası', 'mass'] },
  'marjinal': { desc: 'Marjinal Kozmetik, Türkiye\'de uygun fiyatlı ev tipi cilt + saç bakım markası. Bitkisel hatlar ve essence-tarzı temel ürünler. Market kanalında.', tagline: 'Erişilebilir bakım', year: 2010, cats: ['türk markası', 'mass', 'kişisel bakım', 'şampuan'] },
  'ph-lab': { desc: 'PH Lab, Türkiye\'nin ph-dengeli cilt bakım markası. Yüz temizleyici, toner ve nemlendirici hatları ile hassas cilt segmentinde. pH 5.5 cilt dostu formülasyonlar.', tagline: 'pH dengeli bakım', year: 2017, cats: ['pH dengeli', 'türk markası', 'temizleyici', 'mass'] },
  'good-day': { desc: 'Good Day, Türkiye\'nin doğal ve clean beauty cilt bakım markası. Vitamin C, niasinamid, AHA serumları ile uygun fiyatlı dermokozmetik. Online satış odaklı.', tagline: 'İyi bir gün için', year: 2020, cats: ['vitamin C', 'serum', 'türk markası', 'clean'] },
  'uni-baby': { desc: 'Uni Baby, Türkiye\'nin Hayat Holding bünyesindeki bebek bakım markası. Şampuan, ıslak mendil ve cilt bakım ürünleri ile aile pazarında lider. Hassas bebek cildi için dermatolog testli.', tagline: 'Türk bebek bakımı', year: 2008, cats: ['bebek', 'şampuan', 'türk markası', 'mendil'] },
  'selfit': { desc: 'Selfit, Türkiye\'nin Ozonia Kozmetik bünyesindeki ev tipi cilt bakım markası. Nemlendirici ve temizleyici hatları ile uygun fiyat segmenti.', tagline: 'Kendine iyi davran', year: 2015, cats: ['nemlendirici', 'türk markası', 'mass', 'temizleyici'] },
  'pierre-cardin': { desc: 'Pierre Cardin Cosmetics, Fransız tasarımcı Pierre Cardin\'in lisanslı kozmetik markası. Türkiye\'de çeşitli üreticiler tarafından üretiliyor. Parfüm, makyaj ve cilt bakım ürünleri.', tagline: 'Klasik Fransız adı', year: 1970, cats: ['parfüm', 'makyaj', 'fransız', 'mass'] },
  'wlab': { desc: 'WLab, Türkiye\'nin clean beauty + uygun fiyat odaklı cilt bakım markası. Niasinamid 10%, Hyaluronic Acid 2%, Salicylic Acid 2% gibi tek-aktif serumlar. The Ordinary tarzı şeffaf formülasyon.', tagline: 'Şeffaf clean Türk markası', year: 2020, cats: ['niasinamid', 'aktif', 'türk markası', 'serum'] },
  'icollagen': { desc: 'iCollagen, Türkiye\'nin oral kolajen + saç-tırnak takviyesi markası. Hidrolize Tip I + III kolajen formülasyonları ile cilt elastikiyeti + saç sağlığı odaklı.', tagline: 'Kolajenle güçlen', year: 2018, cats: ['kolajen', 'türk markası', 'saç-tırnak', 'oral'] },
  'bee-beauty': { desc: 'Bee Beauty, Türkiye\'nin Bilişim Group bünyesindeki kozmetik markası. Geniş cilt bakım + makyaj portföyü ile uygun fiyat segmenti. Doğal aktif vurgulu (Aloe, Centella).', tagline: 'Doğal güzellik', year: 2010, cats: ['makyaj', 'cilt bakım', 'türk markası', 'mass'] },
  'licape': { desc: 'Licape, Türkiye\'nin gıda takviyesi markası. Vitamin, mineral ve özel formülasyonlar (Beauty Elixir, Sleep, Slim) ile online satış kanalında. Yenilikçi formüllerle bilinir.', tagline: 'Bilim destekli takviye', year: 2017, cats: ['takviye', 'türk markası', 'kolajen', 'multivit'] },
  'the-purest-solutions': { desc: 'The Purest Solutions, Türkiye\'nin clean beauty + minimal bileşen cilt bakım markası. PHA, vitamin C ve hyaluronik asit serumları ile şeffaf formülasyon felsefesi. Vegan + cruelty-free.', tagline: 'En saf çözüm', year: 2019, cats: ['PHA', 'C vitamini', 'türk markası', 'clean'] },
  'the-ceel': { desc: 'The Ceel, Türkiye\'nin clean beauty cilt bakım markası. Mineral SPF, niasinamid ve cica serumları ile dermatolog tavsiyeli formülasyonlar. Hassas + reaktif ciltlere yönelik.', tagline: 'Hassas cilt için clean', year: 2020, cats: ['mineral SPF', 'cica', 'türk markası', 'hassas'] },
  'zade-vital': { desc: 'Zade Vital, Türkiye\'nin Zade grubuna ait gıda takviyesi markası. Magnezyum, Omega-3 ve B vitamini formülasyonları ile eczane kanalında. Türk firması, klinik test destekli.', tagline: 'Sağlığa Türk dokunuşu', year: 2012, cats: ['magnezyum', 'omega', 'türk markası', 'B vitamini'] },
  'watsons': { desc: 'Watsons, A.S. Watson grubuna ait Hong Kong kökenli kişisel bakım marketi. Türkiye\'de eczane + market hibrit kanal ile, kendi private label cilt bakım ürünleri (Watsons brand) sunar.', tagline: 'Sağlığın için her şey', year: 1841, cats: ['kişisel bakım', 'private label', 'mağaza', 'mass'] },
  'tbt': { desc: 'TBT, Türkiye\'nin uygun fiyatlı kişisel bakım + makyaj markası. Geniş portföy ile pazar perakendesinde. Dudak balsam ve nemlendirici hatları ile bilinir.', tagline: 'Türk bakım klasikleri', year: 2005, cats: ['kişisel bakım', 'türk markası', 'mass', 'dudak'] },
  'wellcare': { desc: 'Wellcare, Türkiye\'nin gıda takviyesi markası. Multivitamin, omega-3 ve özel kadın formülasyonları ile eczane + online kanal. Klinik test ve kalite vurgusu.', tagline: 'Sağlık iyi yaşamdır', year: 2016, cats: ['takviye', 'multivit', 'türk markası', 'kadın'] },
  'venatura': { desc: 'Venatura, Türkiye\'nin clean beauty + doğal odaklı cilt bakım markası. Kapuçino ve Çay Ağacı yağ hatları ile niş ürünler. Sürdürülebilir + paraben-free.', tagline: 'Doğanın özünden', year: 2018, cats: ['doğal', 'türk markası', 'organik', 'tea tree'] },
  'erbatab': { desc: 'Erbatab, Türkiye\'nin bitkisel takviye markası. Erba (İtalyanca "ot") köklü bitkilerden geleneksel formülasyonlar. Çinko + selenyum + vitamin C kombinleri eczanelerde.', tagline: 'Doğanın bitkisel gücü', year: 2010, cats: ['bitkisel', 'türk markası', 'eczane', 'çinko'] },

  // Diğer
  'pixi': { desc: 'Pixi Beauty, 1999\'da İngiltere\'de Petra Strand tarafından kurulan glow-odaklı kozmetik markası. Glow Tonic (glikolik asit toner) ile global popülerlik kazandı. Dewy + radiant estetik.', tagline: 'Glow her gün', year: 1999, cats: ['glow', 'AHA', 'tonic', 'makyaj'] },
  'pantene': { desc: 'Pantene, 1947\'de İsviçre\'de geliştirilen, P&G grubuna ait şampuan + saç bakım markası. Pro-V (Pantenol) formülü ile global pazar lideri. Hasarlı saç + onarım hatları.', tagline: 'Güçlü, parlak saç', year: 1947, cats: ['saç bakım', 'şampuan', 'pantenol', 'mass'] },
  'the-inkey-list-2': { desc: 'The Inkey List, 2018\'de İngiltere\'de kurulan, klinik aktif odaklı uygun fiyatlı cilt bakım markası. Niasinamid 10%, retinol, hyaluronik asit gibi tek-aktif serumlar. Eğitici marka iletişimi.', tagline: 'Klinik aktifler, dürüst fiyat', year: 2018, cats: ['niasinamid', 'retinol', 'aktif', 'şeffaf'] },
  'pharmaton': { desc: 'Pharmaton, GSK grubunun 1957\'de İsviçre\'de çıkardığı multivitamin + Panax Ginseng içerikli takviye markası. Kapsül ve şurup formatlarında. Eczane kanalında konumlanmış.', tagline: 'Enerjik yaşam', year: 1957, cats: ['multivitamin', 'ginseng', 'eczane', 'kapsül'] },
  'peripera': { desc: 'Peripera, Kore\'nin Clio Cosmetics bünyesindeki K-pop estetik makyaj markası. Ink Velvet ruj ve Pure Blushed Sunshine Cheek ile genç kitlede pazar lideri. Renk varyasyonu zengin.', tagline: 'K-pop makyajı', year: 2010, cats: ['ruj', 'allık', 'K-beauty', 'genç'] },
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
    if (r.rowCount && r.rowCount > 0) { updated++; }
    else skipped++;
  } catch (e) { skipped++; }
}
console.log(`[2] Updated: ${updated}, Skipped: ${skipped}`);

const final = await c.query(`SELECT COUNT(*) FILTER (WHERE brand_description IS NOT NULL AND length(brand_description) > 50) AS with_desc, COUNT(*) AS total FROM brands WHERE is_active=true`);
console.log(`Total brands with desc: ${final.rows[0].with_desc}/${final.rows[0].total}`);

await c.end();
