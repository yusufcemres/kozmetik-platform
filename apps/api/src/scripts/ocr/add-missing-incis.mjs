/**
 * OCR'dan kalan eksik INCI'leri DB'ye ekler.
 * Sadece gercek INCI/botanik isim olanlari (OCR hatasi olmayan).
 *
 * Ekleme sonrasi merge-ocr-to-db.mjs tekrar calistirilirsa eksik baglantilar dolar.
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

function turkishSlug(text) {
  return (text || '').toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// OCR'da eksik bulunan gercek INCI'ler (manuel curate)
const MISSING_INCIS = [
  { inci: 'Phenylpropanol', common: 'Phenylpropanol', group: 'Koruyucu', fn: 'Modern alternatif koruyucu, paraben-free formullerde phenoxyethanol benzeri', grade: 'C' },
  { inci: 'Stevia Rebaudiana Extract', common: 'Stevia (Stevia Rebaudiana)', group: 'Tatlandirici', fn: 'Dogal tatlandirici, dis macunu ve agiz urunlerinde seker yerine', grade: 'B' },
  { inci: 'Activated Charcoal', common: 'Aktif Karbon', group: 'Adsorban', fn: 'Cilt yuzeyinden toksin ve sebum adsorbe eder, mekanik temizleyici', grade: 'C' },
  { inci: 'Sodium Saccharin', common: 'Sodyum Sakarin', group: 'Tatlandirici', fn: 'Yapay tatlandirici, dis macunu/agiz urunlerinde lezzet', grade: 'B' },
  { inci: 'Bambusa Arundinacea Stem Extract', common: 'Bambu Govde Ozutu', group: 'Bitkisel ekstre', fn: 'Silika kaynagi, dogal eksfoliyant ve sicim guclendirici', grade: 'C' },
  { inci: 'Olive Wax', common: 'Zeytin Mumu', group: 'Yumusatici/yag', fn: 'Zeytinden elde edilen dogal mum, emolyent ve oklusiv', grade: 'B' },
  { inci: 'Salvadora Persica Bark Extract', common: 'Miswak (Salvadora Persica)', group: 'Bitkisel ekstre', fn: 'Geleneksel agiz hijyeni bitkisi, antibakteriyel + dis beyazlatici', grade: 'B' },
  { inci: 'Cinnamomum Cassia Extract', common: 'Cin Tarcin Ozutu', group: 'Bitkisel ekstre', fn: 'Antimikrobiyal, antioksidan, sicak nota veren bitki', grade: 'C' },
  { inci: 'Isopentyldiol', common: 'Izopentil Diol', group: 'Solven/humektant', fn: 'Hafif nemlendirici ve solven, gercek formulasyonlarda', grade: 'C' },
  { inci: 'Cetearyl Olivate', common: 'Setearil Olivat', group: 'Emulgator', fn: 'Zeytinyagindan turetilmis dogal emulgator, krem/losyon yapida', grade: 'B' },
  { inci: 'Tilia Cordata Flower Extract', common: 'Ihlamur Cicegi Ozutu', group: 'Bitkisel ekstre', fn: 'Yatistirici, anti-irritan, hassas cilt destegi', grade: 'C' },
  { inci: 'Chamomilla Recutita Extract', common: 'Papatya Ozutu', group: 'Bitkisel ekstre', fn: 'Yatistirici, anti-inflamatuar, kizariklik gideri', grade: 'B' },
  { inci: 'Sorbitan Caprylate', common: 'Sorbitan Kaprilat', group: 'Koruyucu booster', fn: 'Anti-mikrobiyal yardimci, dogal koruyucu sistemde', grade: 'C' },
  { inci: 'Lactose Palmitate', common: 'Laktoz Palmitat', group: 'Emulgator', fn: 'Sut sekeri ve palm yagindan turetilmis emulgator', grade: 'C' },
  { inci: 'Mentha Viridis Leaf Oil', common: 'Spearmint Yag (Yesil Nane)', group: 'Esansiyel yag', fn: 'Spearmint yagi, ferah aroma + hafif antimikrobiyal', grade: 'C' },
  { inci: 'Sorbitan Olivate', common: 'Sorbitan Olivat', group: 'Emulgator', fn: 'Zeytin turevli emulgator, Cetearyl Olivate ile kombinasyonda', grade: 'B' },
  { inci: 'Glycerol', common: 'Glycerol (= Glycerin)', group: 'Nemlendirici', fn: 'Glycerin\\'in alternatif yazimi, humektant', grade: 'A' },
  { inci: 'Potassium Alum', common: 'Sap Tasi (Potasyum Alum)', group: 'Astrenjan', fn: 'Mineral, deodorant ve astrenjan, traş sonrası kanama durdurma', grade: 'C' },
  { inci: 'Atelocollagen', common: 'Ateloollajen', group: 'Protein', fn: 'Tip 1 kollajen, hidrolize edilmis, nemlendirici ve film olusturucu', grade: 'C' },
  { inci: 'Coco-Polyglucose', common: 'Koko-Poliglikoz', group: 'Surfaktan', fn: 'Hindistan cevizi turevli yumusak bitkisel surfaktan', grade: 'B' },
  { inci: 'Eucalyptol', common: 'Eukaliptol (1,8-Cineole)', group: 'Esansiyel bilesik', fn: 'Eukaliptus, kekik ve nane uclu eklenmis ana terpenoid, ferah aroma + antimikrobiyal', grade: 'B' },
  { inci: 'Disodium PEG-5 Laurylcitrate Sulfosuccinate', common: 'PEG-5 Lauryl Sitrat Sulfosuksinat', group: 'Surfaktan', fn: 'Yumusak amfoterik koparan, hassas cilt urunlerinde', grade: 'C' },
  { inci: 'Theobroma Cacao Seed Extract', common: 'Kakao Cekirdek Ozutu', group: 'Bitkisel ekstre', fn: 'Kakao tohumundan antioksidan ozu, polifenol icerigi', grade: 'C' },
  { inci: 'Glyceryl Caprylate', common: 'Gliseril Kaprilat', group: 'Koruyucu booster', fn: 'Hindistan cevizinden cikan multifunctional, koruyucu + emolyent', grade: 'B' },
];

await client.connect();
console.log(`Adding ${MISSING_INCIS.length} missing INCIs...\n`);

let added = 0;
let existed = 0;

for (const item of MISSING_INCIS) {
  const slug = turkishSlug(item.inci);
  const exists = await client.query(
    `SELECT ingredient_id FROM ingredients
     WHERE LOWER(inci_name) = LOWER($1) OR ingredient_slug = $2 LIMIT 1`,
    [item.inci, slug],
  );
  if (exists.rows.length > 0) {
    existed++;
    continue;
  }
  await client.query(
    `INSERT INTO ingredients (
      inci_name, common_name, ingredient_slug, ingredient_group,
      function_summary, evidence_grade, evidence_level, origin_type,
      domain_type, is_active, allergen_flag, fragrance_flag,
      preservative_flag, eu_banned, eu_restricted, endocrine_flag,
      created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, 'expert_opinion', 'natural',
      'cosmetic', true, false, false, false, false, false, false,
      NOW(), NOW())`,
    [item.inci, item.common, slug, item.group, item.fn, item.grade],
  );
  added++;
  console.log(`  + ${item.inci} (${slug})`);
}

console.log(`\nAdded: ${added}, Existed: ${existed}, Total target: ${MISSING_INCIS.length}`);
await client.end();
