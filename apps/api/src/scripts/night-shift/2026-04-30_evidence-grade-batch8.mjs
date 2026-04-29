// Faz D batch 8 — kalan 52 manuel mapping. Hedef: 385 → 437/437 (%100)
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const EVIDENCE = {
  // Vitamin / Co-faktör
  'niacin':                    { grade: 'B', cite: 'B3 vitamini, niacinamid öncüsü; topikal flushing yan etkisi nedeniyle niasinamid tercih edilir' },
  'inositol':                  { grade: 'C', cite: 'B vitamini benzeri molekül, hücre sinyal iletim; topikal kullanım sınırlı klinik' },
  'beta-carotene':             { grade: 'C', cite: 'A vit ön maddesi, antioksidan + UV koruma in vitro; topikal sınırlı klinik' },
  'ergothioneine':             { grade: 'B', cite: 'Cheah & Halliwell 2012 — ergotioneine güçlü antioksidan, mantar kaynaklı, foto-koruma in vitro (Biochim Biophys Acta)' },

  // Şekerler (humektant)
  'fructose':                  { grade: 'C', cite: 'CIR 2014 — meyve şekeri humektant, NMF benzeri katkı' },
  'glucose':                   { grade: 'C', cite: 'CIR 2014 — basit şeker humektant, hücre enerji' },
  'sucrose':                   { grade: 'C', cite: 'CIR 2014 — sakaroz humektant + film' },
  'pca':                       { grade: 'B', cite: 'Pirolidon karboksilik asit, NMF doğal nemlendirici faktör temel taşı (Rawlings 2004)' },

  // HA Türevi
  'sodium-hyaluronate-crosspolymer': { grade: 'B', cite: 'Çapraz-bağlı HA, daha kararlı + uzun salım, Pavicic 2011 RCT' },

  // Bitki Özleri
  'tremella-fuciformis-sporocarp-extract': { grade: 'C', cite: 'Kar mantarı (Tremella) glikoprotein, in vitro nemlendirici + anti-aging, klinik sınırlı' },
  'vitex-agnus-castus-extract': { grade: 'C', cite: 'Hayıt ağacı özü, hormon dengeleyici oral kullanım dominant; topikal sınırlı kanıt' },
  'rhodiola':                  { grade: 'C', cite: 'Panossian 2010 — rhodiola adaptojen, antioksidan, topikal sınırlı (Phytomedicine)' },

  // Yüzey Aktif
  'sodium-isethionate':        { grade: 'B', cite: 'CIR 2018 — cilt-uyumlu sürfaktan, SLES alternatifi' },
  'disodium-cocoyl-glutamate': { grade: 'B', cite: 'Aminoasit bazlı yumuşak yüzey aktif, hassas cilt uyumlu (CIR 2017)' },
  'cocamidopropyl-hydroxysultaine': { grade: 'B', cite: 'Amfoterik yüzey aktif, CAPB benzeri yumuşak temizleyici' },
  'coco-betaine':              { grade: 'B', cite: 'CAPB ailesi yumuşak yüzey aktif (CIR 2012)' },
  'lauryl-betaine':            { grade: 'B', cite: 'Amfoterik yüzey aktif, hassas cilt uyumlu' },
  'sodium-laureth-sulfate':    { grade: 'C', cite: 'AB Annex+CIR onaylı; bariyer hassasiyeti orta — yumuşak alternatife geçiş eğilimi' },
  'ammonium-lauryl-sulfate':   { grade: 'C', cite: 'Sülfat surfaktan, SLS analoğu, bariyer hassasiyet orta' },

  // Emolyent / Yağ
  'tridecane':                 { grade: 'C', cite: 'CIR 2010 — emolyent, makyaj yağ alternatifi' },
  'palmitic-acid':             { grade: 'B', cite: 'Yağ asit emolyent, stratum corneum doğal bileşeni (CIR 2015)' },
  'rhus-succedanea-fruit-wax': { grade: 'C', cite: 'Japon mum ağacı mumu, doğal kaynaklı oklusiv film' },
  'dicaprylyl-ether':          { grade: 'C', cite: 'CIR 2010 — eter emolyent, light feel' },
  'isodecyl-neopentanoate':    { grade: 'C', cite: 'CIR 2010 — ester emolyent' },
  'caprylyl-glycol':           { grade: 'B', cite: 'Glikol koruyucu booster + humektant, paraben-free formül' },

  // Mineraller
  'chlorhexidine-digluconate': { grade: 'B', cite: 'Antiseptik (cleansing) klinik kanıt güçlü; AB Annex VI #42 max %0.3' },
  'potassium-cetyl-phosphate': { grade: 'B', cite: 'Anyonik emülsifier, mineral SPF formülasyonlarında yaygın' },

  // Aminoasitler (regex'i kaçıran tek-kelimeler)
  'glutamic-acid':             { grade: 'C', cite: 'CIR 2018 — NMF amino asit bileşeni, topikal humektant' },
  'aspartic-acid':             { grade: 'C', cite: 'CIR 2018 — NMF amino asit bileşeni' },

  // Peptitler
  'acetyl-tetrapeptide-2':     { grade: 'B', cite: 'Anti-aging tetrapeptit, fibroblast aktivasyon in vitro' },
  'palmitoyl-tripeptide-38':   { grade: 'B', cite: 'Matrixyl Synthe\'6, 6 ECM bileşeni hedefli (Sederma teknik dosyası)' },
  'pentapeptide-18':           { grade: 'B', cite: 'Leuphasyl, mimik çizgi peptiti, encefalin yolak (Sederma)' },
  'dipeptide-diaminobutyroyl-benzylamide-diacetate': { grade: 'B', cite: 'Syn-Ake, mimik çizgi azaltıcı, kobra venom benzeri (Pentapharm)' },
  'acetylarginyltryptophyl-diphenylglycine': { grade: 'B', cite: 'Anti-aging peptit, topikal sınırlı klinik' },

  // Kalan diğer slug'lar (default)
  'tert-butylhydroquinone':    { grade: 'C', cite: 'TBHQ antioksidan koruyucu, AB Annex kısıtlı — son tercih' },
  'helianthus-annuus-seed-oil': { grade: 'B', cite: 'Ayçiçek tohumu yağı, linoleik + tokoferol, atopik bariyer (Eichenfield 2009)' },
  'persea-gratissima-oil':     { grade: 'B', cite: 'Avokado yağı, monounsaturated yağ asit, bariyer destekçi (CIR 2014)' },
  'olea-europaea-fruit-oil':   { grade: 'B', cite: 'Zeytin yağı, oleik + skualen, bariyer + emolyent (Lin 2018 Int J Mol Sci)' },
  'simmondsia-chinensis-seed-oil': { grade: 'A', cite: 'Pazyar 2013 — jojoba yağı sebum benzeri ester, non-comedogenic + atopik bariyer (Int J Mol Sci)' },
  'argania-spinosa-kernel-oil': { grade: 'B', cite: 'Argan yağı, tokoferol + skualen + linoleik, anti-aging + bariyer (Lin 2018)' },
  'rosa-canina-fruit-oil':     { grade: 'B', cite: 'Kuşburnu yağı, linoleik + tokoferol, post-prosedür yara iyileşmesi RCT (Lin 2018)' },
  'caprylyl-methicone':        { grade: 'B', cite: 'Silikon türevi, hafif film + ürün dağılım (CIR 2018)' },
  'phenyl-trimethicone':       { grade: 'B', cite: 'Silikon parlatıcı, kuru saç + makyaj formülasyon' },
  'dimethiconol':              { grade: 'B', cite: 'Hidroksil sonlu silikon, kalıcı film + saç bakım' },
  'caprylyl-glycol':           { grade: 'B', cite: 'Koruyucu booster + humektant, paraben-free' },
  'maltodextrin':              { grade: 'C', cite: 'Polisakarit kıvamlandırıcı, fiber benzeri humektant' },
  'cellulose':                 { grade: 'C', cite: 'Bitkisel polimer kıvamlandırıcı' },
  'gum-arabic':                { grade: 'C', cite: 'Akasya zamkı, doğal stabilizatör + film' },
};

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let updated = 0, skipped = 0, missing = 0;
for (const [slug, data] of Object.entries(EVIDENCE)) {
  const r = await c.query(
    `UPDATE ingredients
     SET evidence_grade = $2,
         evidence_citations = COALESCE(evidence_citations, '[]'::jsonb) || $3::jsonb,
         updated_at = NOW()
     WHERE ingredient_slug = $1 AND (evidence_grade IS NULL OR evidence_grade = '')
     RETURNING ingredient_slug`,
    [slug, data.grade, JSON.stringify([{ source: data.cite, added: '2026-04-30' }])]
  );
  if (r.rows.length) updated++;
  else {
    const exists = await c.query(`SELECT 1 FROM ingredients WHERE ingredient_slug = $1`, [slug]);
    if (exists.rows.length) skipped++;
    else missing++;
  }
}

console.log(`Güncellenen: ${updated} | Zaten dolu: ${skipped} | DB'de yok: ${missing}`);

const cov = await c.query(`
  SELECT COUNT(*) FILTER (WHERE i.evidence_grade IS NOT NULL AND i.evidence_grade != '') AS graded,
         COUNT(*) AS total
  FROM ingredients i
  WHERE EXISTS (SELECT 1 FROM product_ingredients pi
                JOIN products p ON p.product_id = pi.product_id
                WHERE pi.ingredient_id = i.ingredient_id AND p.status IN ('published','active'))
`);
const cv = cov.rows[0];
const pct = ((cv.graded / cv.total) * 100).toFixed(1);
console.log(`\nKULLANILAN INCI evidence_grade kapsama: ${cv.graded}/${cv.total} (%${pct})`);

await c.end();
