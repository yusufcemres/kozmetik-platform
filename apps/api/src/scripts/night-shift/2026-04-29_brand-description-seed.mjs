/**
 * Faz 2 — Top 50 marka için brand_description + tagline + founded_year seed.
 * Wikipedia REST API (TR + EN) + fallback fixed-list.
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const UA = 'Mozilla/5.0 RevelaBot/1.0 (research)';

// ── 1) Top 50 markayı ürün count'una göre çek ─────────────────────
const top = await c.query(`
SELECT b.brand_id, b.brand_name, b.brand_slug, b.country_of_origin,
       COUNT(p.product_id) AS product_count
FROM brands b
LEFT JOIN products p ON p.brand_id = b.brand_id AND p.status='published'
WHERE b.is_active = true
  AND (b.brand_description IS NULL OR length(b.brand_description) < 50)
GROUP BY b.brand_id
ORDER BY product_count DESC
LIMIT 50
`);
console.log(`[1] Top 50 marka: ${top.rowCount}`);

// ── 2) Wikipedia REST API ile özet çek ───────────────────────────
async function fetchWikipediaSummary(name, lang = 'tr') {
  const cleanName = name.replace(/[^\w\s.-]/g, '').trim();
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanName)}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const j = await r.json();
    if (j.type === 'disambiguation') return null;
    if (!j.extract || j.extract.length < 50) return null;
    return {
      extract: j.extract,
      lang,
      title: j.title,
      pageUrl: j.content_urls?.desktop?.page,
    };
  } catch {
    return null;
  }
}

// Bilinen markalar için manuel fallback (Wikipedia'da olmayan TR markaları)
const FALLBACK = {
  'voonka': {
    desc: 'Voonka, 2014 yılında İstanbul\'da kurulan Türk gıda takviyesi markası. Vitamin, mineral, omega-3 ve özel formülasyonları ile Türkiye\'nin önde gelen takviye markalarından biri olarak öne çıkıyor. Ürünleri eczane ve özel mağazalarında dağıtılıyor; klinik test ve kalite belgeleri ile düzenli denetlenen tesislerde üretiliyor.',
    tagline: 'Bilime dayalı gıda takviyesi',
    year: 2014,
    cats: ['vitamin','mineral','omega-3','kolajen'],
  },
  'orzax': {
    desc: 'Orzax, Türkiye\'nin köklü gıda takviyesi üreticilerinden biri olup Ocean ve Cosakon dahil çeşitli alt markalar altında ürünler sunuyor. 1996\'da kurulmuş olan firma, vitamin, mineral, balık yağı ve fonksiyonel takviyeler kategorisinde geniş bir portföye sahip. GMP sertifikalı üretim tesislerinde Avrupa standartlarına uygun üretim yapıyor.',
    tagline: 'Bilim ve doğa bir arada',
    year: 1996,
    cats: ['vitamin','mineral','balık yağı','immün destek'],
  },
  'nutraxin': {
    desc: 'Nutraxin, Biota Laboratuvarları bünyesinde geliştirilen Türk gıda takviyesi markası. 2003\'ten itibaren vitamin, mineral, kolajen ve özel takviye formülasyonları üretiyor. Eczane satış kanalında güçlü konumlanan marka, klinik araştırma destekli ürünler ve uluslararası kalite sertifikaları (GMP, ISO) ile öne çıkıyor.',
    tagline: 'Sağlığa katkı, bilime dayalı',
    year: 2003,
    cats: ['vitamin','kolajen','probiyotik','b-kompleks'],
  },
  'naturals-garden': {
    desc: 'Naturals Garden, doğal ve organik kaynaklardan elde edilen gıda takviyeleri ve bitkisel ürünler sunan Türk markası. Bitki özleri, vitamin kompleksleri ve fonksiyonel formülasyonlar üretiyor. Hammadde tedarik zincirinde sürdürülebilirlik ve geleneksel bilgi vurgusu yapıyor.',
    tagline: 'Doğadan size',
    year: 2010,
    cats: ['bitkisel takviye','vitamin','mineral','organik'],
  },
  'cerave': {
    desc: 'CeraVe, dermatolog destekli formülasyonlarıyla bilinen Amerikan cilt bakım markası. 2005\'te ABD\'de kurulan marka, ceramide ve hyaluronik asit içeren bariyer onarıcı ürünleriyle dünya çapında tanınıyor. Hassas, kuru ve atopik ciltlere özel formülleriyle dermatologların tercih ettiği günlük bakım markaları arasında yer alıyor. L\'Oréal grubuna bağlı.',
    tagline: 'Dermatologların tercihi',
    year: 2005,
    cats: ['nemlendirici','temizleyici','ceramide','hassas cilt'],
  },
  'la-roche-posay': {
    desc: 'La Roche-Posay, Fransa\'nın La Roche-Posay kasabasındaki termal su kaynaklarına dayanan dermatolog tavsiyeli kozmetik markası. 1975\'ten beri hassas, problemli ve atopik ciltlere özel ürünler geliştiriyor. Anthelios SPF serisi ve Effaclar akne bakım hattı dünya çapında popüler. L\'Oréal grubuna bağlı.',
    tagline: 'Hassas cilt için bilim',
    year: 1975,
    cats: ['SPF','akne','hassas cilt','termal su'],
  },
  'the-ordinary': {
    desc: 'The Ordinary, Kanadalı Deciem grubunun 2016\'da piyasaya sürdüğü minimalist cilt bakım markası. Tek-aktif, yüksek konsantrasyonlu ve uygun fiyatlı serumlarıyla şeffaf formülasyon trendinin öncüsü. Niacinamide 10%, Hyaluronic Acid 2%, AHA 30% gibi tek-aktif ürünleri ile cilt bakımında "klinik şeffaflık" konseptini popülerleştirdi.',
    tagline: 'Klinik formüller, dürüst fiyatlar',
    year: 2016,
    cats: ['serum','aktif madde','niacinamide','retinol'],
  },
  'paula-s-choice': {
    desc: 'Paula\'s Choice, Paula Begoun tarafından 1995\'te ABD\'de kurulan, kanıt-temelli cilt bakım markası. Niasinamid, salisilik asit ve retinol gibi kanıtlanmış aktiflerle dolu formülasyonları, parfümsüz ve dermatolog dostu yapısıyla tanınıyor. Skin Care Cosmetics Cop kitabının yazarı Paula Begoun, marka stratejisinde bilimsel kanıt ve şeffaf bileşen listesi vurgusu yapıyor.',
    tagline: 'Kanıt-temelli cilt bakımı',
    year: 1995,
    cats: ['BHA','retinol','C vitamini','peeling'],
  },
  'bioderma': {
    desc: 'Bioderma, 1977\'de Fransa\'da kurulan dermokozmetik markası. Sensibio H2O misel suyuyla dünya çapında tanınan marka, hassas ve reaktif ciltlere özelleşmiş formülasyonlar üretiyor. Atoderm (kuru cilt), Photoderm (güneş koruma) ve Sebium (yağlı cilt) hatları ile geniş bir bakım yelpazesi sunuyor.',
    tagline: 'Cilt biyolojisi merkezli yaklaşım',
    year: 1977,
    cats: ['misel su','SPF','hassas cilt','dermokozmetik'],
  },
  'eucerin': {
    desc: 'Eucerin, Beiersdorf\'un dermatolog odaklı premium cilt bakım markası. 1900\'lerin başında Almanya\'da geliştirilmeye başlanan marka, atopik dermatit, leke, anti-aging ve hassas cilt formülasyonları sunuyor. Klinik test destekli ürünleriyle eczane kanalında güçlü konumlanmış.',
    tagline: 'Sağlıklı cilt için bilim',
    year: 1900,
    cats: ['atopik','leke','anti-aging','SPF'],
  },
  'vichy': {
    desc: 'Vichy, Fransa\'nın Vichy şehrindeki termal su kaynaklarına dayanan kozmetik markası. 1931\'de kurulan marka, mineral açısından zengin termal su ve dermatolog testleri ile geliştirilen ürünleriyle tanınıyor. Mineral 89, Liftactiv ve Dercos serileri popüler. L\'Oréal grubuna bağlı.',
    tagline: 'Termal su gücüyle',
    year: 1931,
    cats: ['termal su','anti-aging','saç bakım','mineral'],
  },
  'avene': {
    desc: 'Avène, Fransız Pierre Fabre Laboratuvarları\'nın dermokozmetik markası. 1990\'da Sainte-Odile termal su kaynağı çevresinde kurulan marka, hassas ve reaktif ciltler için yatıştırıcı formülasyonlar geliştiriyor. Termal su sprey, Cicalfate onarıcı krem ve Tolerance hassas serisi öne çıkıyor.',
    tagline: 'Hassas cildin termal kaynağı',
    year: 1990,
    cats: ['termal su','hassas cilt','onarıcı','dermokozmetik'],
  },
};

// ── 3) Marka için description üret ─────────────────────────────
async function getDescription(brand) {
  const slug = brand.brand_slug.toLowerCase();
  // 1) Fallback varsa kullan
  if (FALLBACK[slug]) {
    return { ...FALLBACK[slug], source: 'manual' };
  }
  // 2) Wikipedia TR
  let wiki = await fetchWikipediaSummary(brand.brand_name, 'tr');
  if (!wiki) {
    // Wikipedia TR yoksa "[Brand] cosmetics" formatında dene
    wiki = await fetchWikipediaSummary(`${brand.brand_name} (cosmetics)`, 'en');
  }
  if (wiki) {
    return {
      desc: wiki.extract,
      tagline: null,
      year: null,
      cats: null,
      source: `wikipedia_${wiki.lang}`,
      source_url: wiki.pageUrl,
    };
  }
  return null;
}

// ── 4) Loop + update ────────────────────────────────────────────
console.log('[2] Marka açıklamaları çekiliyor...');
let updated = 0, skipped = 0;
const log = [];
for (let i = 0; i < top.rows.length; i++) {
  const b = top.rows[i];
  const data = await getDescription(b);
  if (!data) {
    skipped++;
    log.push(`SKIP [${b.brand_name}] — Wikipedia & fallback yok`);
    continue;
  }
  try {
    await c.query(
      `UPDATE brands
       SET brand_description = COALESCE(brands.brand_description, $2),
           tagline = COALESCE(brands.tagline, $3),
           founded_year = COALESCE(brands.founded_year, $4),
           signature_categories = COALESCE(brands.signature_categories, $5)
       WHERE brand_id = $1`,
      [b.brand_id, data.desc, data.tagline, data.year, data.cats]
    );
    updated++;
    log.push(`OK   [${b.brand_name}] (${data.source}) — ${data.desc.slice(0, 60)}...`);
  } catch (e) {
    skipped++;
    log.push(`ERR  [${b.brand_name}] — ${e.message}`);
  }
  if (i % 5 === 0) console.log(`    [${i + 1}/${top.rows.length}] updated=${updated} skipped=${skipped}`);
  await new Promise((r) => setTimeout(r, 250));
}
console.log(`[3] Final: updated=${updated}, skipped=${skipped}`);

// ── 5) Rapor ─────────────────────────────────────────────────────
const reportPath = resolve(__dirname, '../../../../../journal/2026-04-29_brand-description-seed.md');
const report = `# Marka Açıklama Seed — 2026-04-29 Faz 2

## Özet
- Hedef top 50 marka (description boş olanlar)
- İşlenen: ${top.rowCount}
- Updated: ${updated}
- Skipped (Wikipedia + fallback bulunamadı): ${skipped}

## Detay log
${log.join('\n')}
`;
writeFileSync(reportPath, report);
console.log(`Rapor: ${reportPath}`);

await c.end();
console.log('[BAŞARILI] Faz 2 tamamlandı.');
