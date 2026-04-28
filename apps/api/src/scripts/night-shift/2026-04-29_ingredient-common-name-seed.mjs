/**
 * Faz 1.5 — Top 60 popüler INCI için Türkçe trivial / yaygın isim seed.
 * Hardcoded mapping (slug → common_name).
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Türkçe trivial / yaygın isim mapping (top 100+ INCI)
const COMMON_NAMES = {
  // Temel
  'aqua': 'Su',
  'water': 'Su',
  'glycerin': 'Gliserin',
  'butylene-glycol': 'Bütilen Glikol',
  'propylene-glycol': 'Propilen Glikol',
  'pentylene-glycol': 'Pentilen Glikol',
  'dipropylene-glycol': 'Dipropilen Glikol',
  '12-hexanediol': '1,2-Heksandiol',
  'sorbitol': 'Sorbitol',

  // Aktifler — Vitaminler
  'niacinamide': 'Niasinamid (B3 Vitamini)',
  'retinol': 'Retinol (A Vitamini)',
  'retinyl-palmitate': 'Retinil Palmitat (A Vit. Esteri)',
  'tocopherol': 'E Vitamini (Tokoferol)',
  'tocopheryl-acetate': 'E Vitamini Asetat',
  'ascorbic-acid': 'C Vitamini (Askorbik Asit)',
  '3-o-ethyl-ascorbic-acid': '3-O-Etil Askorbik Asit (C Vit. Türevi)',
  'sodium-ascorbyl-phosphate': 'Sodyum Askorbil Fosfat (C Vit. Türevi)',
  'ascorbyl-glucoside': 'Askorbil Glikozit (C Vit. Türevi)',
  'panthenol': 'Pantenol (B5 Vitamini)',
  'biotin': 'Biotin (B7 / H Vitamini)',

  // Aktifler — Asitler
  'salicylic-acid': 'Salisilik Asit (BHA)',
  'glycolic-acid': 'Glikolik Asit (AHA)',
  'lactic-acid': 'Laktik Asit (AHA)',
  'mandelic-acid': 'Mandelik Asit (AHA)',
  'azelaic-acid': 'Azelaik Asit',
  'citric-acid': 'Sitrik Asit',
  'hyaluronic-acid': 'Hyalüronik Asit',
  'sodium-hyaluronate': 'Sodyum Hyalüronat',

  // Aktifler — Diğer
  'caffeine': 'Kafein',
  'allantoin': 'Allantoin',
  'centella-asiatica-leaf-extract': 'Centella Asiatica (Cica)',
  'aloe-barbadensis-leaf-juice': 'Aloe Vera Özü',
  'glycyrrhiza-glabra-root-extract': 'Meyan Kökü Özü',
  'camellia-sinensis-leaf-extract': 'Yeşil Çay Özü',
  'matricaria-chamomilla-flower-extract': 'Papatya Özü',
  'calendula-officinalis-flower-extract': 'Aynısefa Özü',
  'arnica-montana-flower-extract': 'Arnika Çiçek Özü',
  'curcuma-longa-root-extract': 'Zerdeçal Özü',
  'zingiber-officinale-root-extract': 'Zencefil Kök Özü',
  'lavandula-angustifolia-flower-extract': 'Lavanta Çiçek Özü',
  'rosa-damascena-flower-water': 'Gül Suyu',
  'hamamelis-virginiana-leaf-extract': 'Cadı Fındığı Özü',
  'echinacea-purpurea-extract': 'Ekinezya Özü',
  'panax-ginseng-root-extract': 'Ginseng Kök Özü',
  'ginkgo-biloba-leaf-extract': 'Ginkgo Biloba Özü',

  // Yağlar / Lipidler
  'capryliccapric-triglyceride': 'Kaprilik/Kaprik Trigliserit (Hindistan Cevizi/Palm Yağı Türevi)',
  'isopropyl-myristate': 'İzopropil Miristat',
  'isopropyl-palmitate': 'İzopropil Palmitat',
  'cetyl-alcohol': 'Setil Alkol (Yağ Alkolü)',
  'stearyl-alcohol': 'Stearil Alkol (Yağ Alkolü)',
  'behenyl-alcohol': 'Behenil Alkol',
  'stearic-acid': 'Stearik Asit',
  'oleic-acid': 'Oleik Asit',
  'linoleic-acid': 'Linoleik Asit (Omega-6)',

  // Silikonlar
  'dimethicone': 'Dimetikon (Silikon)',
  'cyclopentasiloxane': 'Siklopentasiloksan (Silikon)',
  'dimethiconol': 'Dimetikonol (Silikon)',
  'phenyl-trimethicone': 'Fenil Trimetikon (Silikon)',
  'cetyl-dimethicone': 'Setil Dimetikon (Silikon)',
  'dimethiconevinyl-dimethicone-crosspolymer': 'Dimetikon Crosspolymer (Silikon)',

  // Koruyucular
  'phenoxyethanol': 'Fenoksietanol (Koruyucu)',
  'potassium-sorbate': 'Potasyum Sorbat (Koruyucu)',
  'sodium-benzoate': 'Sodyum Benzoat (Koruyucu)',
  'caprylhydroxamic-acid': 'Kaprilhidroksamik Asit (Koruyucu)',
  'ethylhexylglycerin': 'Etilheksilgliserin (Koruyucu/Yumuşatıcı)',
  'benzyl-alcohol': 'Benzil Alkol (Koruyucu)',
  'methylparaben': 'Metilparaben (Koruyucu)',
  'propylparaben': 'Propilparaben (Koruyucu)',

  // pH ayarlayıcılar
  'sodium-hydroxide': 'Sodyum Hidroksit (pH Ayarı)',
  'triethanolamine': 'Trietanolamin (pH Ayarı)',
  'aminomethyl-propanol': 'Aminometil Propanol (pH Ayarı)',

  // Kıvamlandırıcılar
  'carbomer': 'Karbomer (Kıvamlandırıcı)',
  'xanthan-gum': 'Ksantan Gam (Kıvamlandırıcı)',
  'hydroxyethyl-cellulose': 'Hidroksietil Selüloz',
  'hydroxypropyl-methylcellulose': 'Hidroksipropil Metil Selüloz',

  // Şelatlayıcılar
  'disodium-edta': 'Disodyum EDTA (Şelat Ajan)',
  'tetrasodium-edta': 'Tetrasodyum EDTA (Şelat Ajan)',
  'tetrasodium-glutamate-diacetate': 'Tetrasodyum Glutamat Diasetat (Şelat Ajan)',

  // Antioksidanlar
  'bht': 'BHT (Antioksidan)',
  'bha': 'BHA (Antioksidan)',

  // Yüzey aktif madde
  'polysorbate-20': 'Polisorbat 20',
  'polysorbate-60': 'Polisorbat 60',
  'polysorbate-80': 'Polisorbat 80',
  'peg-40-stearate': 'PEG-40 Stearat',
  'peg-20-glyceryl-stearate': 'PEG-20 Gliseril Stearat',
  'sodium-laureth-sulfate': 'SLES (Yüzey Aktif)',
  'sodium-lauryl-sulfate': 'SLS (Yüzey Aktif)',

  // SPF filtreleri
  'octocrylene': 'Oktokrilen (UV Filtresi)',
  'avobenzone': 'Avobenzon (Butil Metoksidibenzoilmetan, UVA Filtresi)',
  'butyl-methoxydibenzoylmethane': 'Avobenzon (UVA Filtresi)',
  'ethylhexyl-methoxycinnamate': 'Oktinoksat / Octinoxate (UVB Filtresi)',
  'ethylhexyl-salicylate': 'Etilheksil Salisilat (UVB Filtresi)',
  'titanium-dioxide': 'Titanyum Dioksit (Mineral SPF)',
  'zinc-oxide': 'Çinko Oksit (Mineral SPF)',
  'homosalate': 'Homosalat (UVB Filtresi)',
  'oxybenzone': 'Oksibenzon / Benzofenon-3 (UVA-UVB Filtresi)',

  // Diğer popüler
  'saccharide-isomerate': 'Sakkarit İzomerat (Bitki Şekeri Nemlendirici)',

  // Takviye - vitaminler
  'cholecalciferol': 'Kolekalsiferol (D3 Vitamini)',
  'cyanocobalamin': 'Siyanokobalamin (B12)',
  'methylcobalamin': 'Metilkobalamin (B12 - Aktif Form)',
  'thiamine-hcl': 'Tiamin HCl (B1 Vitamini)',
  'riboflavin': 'Riboflavin (B2 Vitamini)',
  'pyridoxine-hcl': 'Piridoksin HCl (B6 Vitamini)',
  'folic-acid': 'Folik Asit (B9 Vitamini)',
  'methylfolate': 'Metilfolat (B9 - Aktif Form)',

  // Takviye - mineraller
  'zinc-bisglycinate': 'Çinko Bisglisinat',
  'zinc-citrate': 'Çinko Sitrat',
  'magnesium-bisglycinate': 'Magnezyum Bisglisinat',
  'magnesium-citrate': 'Magnezyum Sitrat',
  'magnesium-oxide': 'Magnezyum Oksit',
  'iron-bisglycinate': 'Demir Bisglisinat',
  'calcium-citrate': 'Kalsiyum Sitrat',
  'calcium-carbonate': 'Kalsiyum Karbonat',
  'selenium-yeast': 'Selenyum (Maya Türevi)',

  // Takviye - omega
  'fish-oil': 'Balık Yağı',
  'krill-oil': 'Krill Yağı',
  'algae-oil': 'Alg Yağı (Vegan Omega-3)',
  'epa': 'EPA (Eikosapentaenoik Asit)',
  'dha': 'DHA (Dokosaheksaenoik Asit)',

  // Takviye - kolajen
  'hydrolyzed-collagen': 'Hidrolize Kolajen',
  'marine-collagen': 'Deniz Kolajeni',

  // Takviye - probiyotik
  'lactobacillus-acidophilus': 'Lactobacillus Acidophilus',
  'bifidobacterium-bifidum': 'Bifidobacterium Bifidum',
  'lactobacillus-rhamnosus': 'Lactobacillus Rhamnosus',
};

console.log(`[1] Mapping size: ${Object.keys(COMMON_NAMES).length}`);

let updated = 0, skipped = 0;
for (const [slug, name] of Object.entries(COMMON_NAMES)) {
  try {
    const r = await c.query(
      `UPDATE ingredients SET common_name = $2 WHERE ingredient_slug = $1 AND (common_name IS NULL OR common_name = '')`,
      [slug, name]
    );
    if (r.rowCount && r.rowCount > 0) {
      updated++;
    } else {
      skipped++;
    }
  } catch (e) {
    console.log(`  ERR ${slug}: ${e.message}`);
    skipped++;
  }
}
console.log(`[2] Updated: ${updated}, Skipped (zaten dolu veya yok): ${skipped}`);

// Sample check
const sample = await c.query(`SELECT ingredient_slug, common_name FROM ingredients WHERE ingredient_slug IN ('niacinamide','salicylic-acid','retinol','glycerin','tocopherol') ORDER BY ingredient_slug`);
console.log('\n## Örnek:');
for (const r of sample.rows) console.log(`  ${r.ingredient_slug.padEnd(20)} → ${r.common_name}`);

await c.end();
console.log('[BAŞARILI] Faz 1.5 tamamlandı.');
