// Function summary batch — kullanılan INCI'lerde %100 kapsama
// Format: 30-120 char, kart üzerinde 3-4 satır görünür
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const SUMMARY = {
  'peptide-complex':           'Birden fazla peptit karışımı; kollajen sentezi destekler ve anti-aging etki sağlar.',
  'jojoba-oil':                'Sebum benzeri bitkisel ester; non-comedogenic, bariyer destekçi yağ.',
  'cica-centella':             'Centella asiatica kompleks aktifi; yatıştırıcı ve bariyer onarımı sağlar.',
  'camellia-sinensis':         'Yeşil çay polifenoli (EGCG); güçlü antioksidan, UV korumaya yardımcı.',
  'heartleaf-extract':         'Houttuynia cordata özütü; anti-enflamatuvar, hassas ve akneye yatkın cilde uygun.',
  'ferulic-acid':              'C ve E vitamini stabilize edici antioksidan; foto-koruma kombinasyonlarında yaygın.',
  'vitamin-b6':                'Pridoksin; cilt enzim metabolizmasını destekler.',
  'ceramide-ap':               'Bariyer lipidi; cildin doğal seramid ailesi üyesi, nem kaybını önler.',
  'egf':                       'Epidermal büyüme faktörü; kollajen sentezi ve hücre yenilenmesi destekçi premium aktif.',
  'mugwort-extract':           'Yavşan otu (Artemisia) özütü; anti-enflamatuvar ve yatıştırıcı.',
  'propolis-extract':          'Arı reçinesi; anti-mikrobiyal ve yara iyileşmesi destekçi.',
  'phytosphingosine':          'Bariyer lipid yapı taşı; seramid sentezi öncüsü, atopik bariyer destekçi.',
  'cholesterol':               'Bariyer trio bileşeni; seramid + yağ asit ile 1:1:1 oranında lipid bariyer onarır.',
  'rosehip-oil':               'Kuşburnu yağı; linoleik asit ve tokoferol kaynağı, post-prosedür yara iyileşmesi.',
  'omega-3':                   'Esansiyel yağ asidi; cilt bariyer ve enflamasyon kontrolü için temel lipid.',
  'licorice-root-extract':     'Meyan kökü özütü; anti-enflamatuvar ve depigmentasyon (glabridin + licochalcone-A).',
  'beta-glucan':               'Yulaf/mantar polisakariti; nemlendirici ve bağışıklık modülatörü.',
  'betaine-salicylate':        'Salisilik asit + betain konjugatı; daha yumuşak BHA türevi, K-beauty.',
  'astaxanthin':               'Karetenoid antioksidan; UV koruma adjuvanı, lipofilik.',
  'polyhydroxy-acid':          'PHA; AHA grubunun en yumuşak üyesi, hassas cilt için tahriş eşiği düşük eksfoliyant.',
  'vitamin-e':                 'Tokoferol; lipofilik antioksidan, C vitamini ile sinerjik foto-koruma.',
  'amino-acids-complex':       'NMF amino asit karışımı; doğal nemlendirici faktör temel taşı.',
  'vitamin-b3':                'Niasin/Niasinamid; sebum, leke ve bariyer dengeleyici çok yönlü vitamin.',
  'rice-extract':              'Pirinç özütü; ferülik asit ve tokotrienol içeriği, antioksidan ve aydınlatıcı.',
  'iron':                      'Demir mineral; oral takviye dominant, topikal sınırlı kullanım.',
  'vitamin-k2':                'Menakuinon (MK-7); kalsiyum metabolizması ve antioksidan, oral kullanım dominant.',
  'grape-seed-extract':        'Üzüm çekirdeği özütü; OPC polifenol, güçlü antioksidan.',
  'colloidal-oatmeal':         'Kolloidal yulaf; FDA OTC monograph onaylı atopik dermatit yatıştırıcı.',
  'vitamin-b12':               'Kobalamin; oral takviye dominant, topikal sınırlı.',
  'gluconolactone':            'PHA grubu; en yumuşak eksfoliyant, hassas cilt için.',
  'retinaldehyde':             'Retinal; retinoik aside tek dönüşüm, retinolden 10× güçlü, OTC retinoid.',
  'turmeric-extract':          'Zerdeçal özütü (kurkumin); anti-enflamatuvar ve aydınlatıcı.',
  'calcium':                   'Kalsiyum mineral; oral kullanım dominant.',
  'bifida-ferment-lysate':     'Bifidobacterium ferment lizatı; mikrobiyom dengesi ve bariyer destekçi.',
  'saccharomyces-ferment':     'Maya fermenti; aminoasit + B vitamini kaynağı, K-beauty postbiyotik.',
  'hemp-seed-oil':             'Kenevir tohumu yağı; omega-3+6 dengeli, atopik bariyere uygun.',
  'galactomyces-ferment':      'Galaktomises ferment (Pitera); sebum ve por görünüm RCT kanıtlı.',
  'probiotics':                'Canlı bakteri suşları; topikal mikrobiyom destekçi.',
  'copper':                    'Bakır mineral; GHK-Cu peptit öncüsü, kollajen sentezi destekçi.',
  'resveratrol':               'Üzüm polifenoli; antioksidan, sirtuin yolak aktivasyonu.',
  'birch-juice':               'Huş ağacı suyu; betulin ve flavonoid antioksidan, K-beauty.',
  'willow-bark-extract':       'Söğüt kabuğu özütü; doğal salisin (BHA alternatifi), anti-enflamatuvar.',
  'guaiazulene':               'Mavi azulene (papatya türevi); anti-enflamatuvar, hassas cilde uygun.',
  'sea-buckthorn-oil':         'Yaban mersini yağı; omega-7 (palmitoleik asit), atopik bariyer destekçi.',
  'kojic-acid':                'Aspergillus oryzae kökenli depigmentasyon aktifi; tirozinaz inhibitörü.',
  // Bonus: ekran görüntüsünden eksik olanlar
  'water':                     'Çözücü ve formülasyon temeli; kozmetik ürünlerin %50-90 oranında ana bileşeni.',
  'aqua':                      'Çözücü ve formülasyon temeli; kozmetik ürünlerin %50-90 oranında ana bileşeni.',
  'benzoyl-peroxide':          'Akne için anti-bakteriyel aktif; P. acnes baskılar, %2.5-10 OTC kullanımı.',
  'cocamidopropyl-hydroxysultaine': 'Amfoterik yüzey aktif; CAPB ailesi, hassas cilt uyumlu yumuşak temizleyici.',
  'sodium-c14-16-olefin-sulfonate': 'Anyonik yüzey aktif; köpük yapıcı temizleyici, sülfat alternatifi.',
  'potassium-hydroxide':       'pH ayarlayıcı bazik tampon; formülasyonda nötralize olur, son üründe serbest yok.',
};

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let updated = 0, skipped = 0, missing = 0;
for (const [slug, summary] of Object.entries(SUMMARY)) {
  const r = await c.query(
    `UPDATE ingredients SET function_summary = $2, updated_at = NOW()
     WHERE ingredient_slug = $1 AND (function_summary IS NULL OR function_summary = '')
     RETURNING ingredient_slug`,
    [slug, summary]
  );
  if (r.rows.length) {
    updated++;
    console.log(`✓ ${slug}`);
  } else {
    const exists = await c.query(`SELECT 1 FROM ingredients WHERE ingredient_slug = $1`, [slug]);
    if (exists.rows.length) skipped++;
    else { missing++; console.log(`✗ ${slug} → DB'de yok`); }
  }
}

console.log(`\nGüncellenen: ${updated} | Zaten dolu: ${skipped} | DB'de yok: ${missing}`);

const cov = await c.query(`
  SELECT COUNT(*) FILTER (WHERE function_summary IS NOT NULL AND function_summary != '') AS filled,
         COUNT(*) AS total
  FROM ingredients i
  WHERE EXISTS (SELECT 1 FROM product_ingredients pi
                JOIN products p ON p.product_id = pi.product_id
                WHERE pi.ingredient_id = i.ingredient_id AND p.status IN ('published','active'))
`);
const cv = cov.rows[0];
const pct = ((cv.filled / cv.total) * 100).toFixed(1);
console.log(`\nKULLANILAN INCI function_summary kapsama: ${cv.filled}/${cv.total} (%${pct})`);

await c.end();
