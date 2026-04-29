/**
 * Faz G — INCI common_name batch 4 (60+ ek INCI).
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const COMMON_NAMES = {
  // Cilt bakım — popüler nemlendirici / aktifler
  'sodium-pca': 'Sodyum PCA (Doğal Nemlendirici Faktör)',
  'panthenol': 'Pantenol (B5 Vitamini)',
  'd-panthenol': 'D-Pantenol (Aktif B5 Formu)',
  'glycerol': 'Gliserol (Gliserin)',
  'urea': 'Üre (Doğal Nemlendirici)',
  'lactic-acid': 'Laktik Asit (AHA)',
  'glycolic-acid': 'Glikolik Asit (AHA)',
  'mandelic-acid': 'Mandelik Asit (AHA)',
  'malic-acid': 'Malik Asit (AHA)',
  'tartaric-acid': 'Tartarik Asit',
  'gluconolactone': 'Glukonolakton (PHA)',
  'lactobionic-acid': 'Laktobiyonik Asit (PHA)',
  'azelaic-acid': 'Azelaik Asit (Akne + Leke)',
  'kojic-acid': 'Kojik Asit (Aydınlatıcı)',
  'tranexamic-acid': 'Traneksamik Asit (Melasma)',
  'arbutin': 'Arbutin (Doğal Aydınlatıcı)',
  'alpha-arbutin': 'Alfa Arbutin (Güçlü Aydınlatıcı)',

  // Peptidler
  'palmitoyl-tripeptide-1': 'Palmitoil Tripeptit-1 (Anti-Aging)',
  'palmitoyl-pentapeptide-4': 'Matrixyl (Pal-KTTKS Anti-Aging)',
  'palmitoyl-tetrapeptide-7': 'Palmitoil Tetrapeptit-7',
  'acetyl-hexapeptide-8': 'Argireline (Topikal Botoks Etkisi)',
  'copper-tripeptide-1': 'Bakır Peptit GHK-Cu',

  // Yağlar / besleyici
  'squalane': 'Skualan (Hassas Cilt Yağı)',
  'squalene': 'Skualen (Sebum Bileşeni)',
  'shea-butter': 'Shea Yağı',
  'butyrospermum-parkii-butter': 'Shea Yağı (Karıte)',
  'argania-spinosa-kernel-oil': 'Argan Yağı',
  'rosa-canina-fruit-oil': 'Kuşburnu Yağı (Doğal Retinoid)',
  'simmondsia-chinensis-seed-oil': 'Jojoba Yağı',
  'helianthus-annuus-seed-oil': 'Ayçiçek Tohumu Yağı',
  'olea-europaea-fruit-oil': 'Zeytin Yağı',
  'cocos-nucifera-oil': 'Hindistan Cevizi Yağı',
  'macadamia-ternifolia-seed-oil': 'Makadamya Yağı',
  'avocado-oil': 'Avokado Yağı',
  'persea-gratissima-oil': 'Avokado Yağı (Persea Gratissima)',
  'prunus-amygdalus-dulcis-oil': 'Tatlı Badem Yağı',
  'sweet-almond-oil': 'Tatlı Badem Yağı',

  // Diğer aktifler
  'ferulic-acid': 'Ferulik Asit (Antioksidan, C+E ile sinerji)',
  'phytic-acid': 'Fitik Asit (Aydınlatıcı)',
  'salicylic-acid': 'Salisilik Asit (BHA)',
  'beta-glucan': 'Beta Glukan (Yatıştırıcı + Bağışıklık)',

  // Çeşitli humektant + nemlendirici
  'sorbitol': 'Sorbitol (Doğal Nemlendirici)',
  'maltitol': 'Maltitol',
  'xylitol': 'Ksilitol',
  'glucose': 'Glukoz (Şeker)',
  'fructose': 'Fruktoz',

  // Çıkartılan / fitokemikal
  'calendula-officinalis-flower-extract': 'Aynısefa Çiçeği Özü',
  'arnica-montana-flower-extract': 'Arnika Çiçeği Özü',
  'salvia-officinalis-leaf-extract': 'Adaçayı Yaprağı Özü',
  'rosmarinus-officinalis-leaf-extract': 'Biberiye Yaprağı Özü',
  'cucumis-sativus-fruit-extract': 'Salatalık Özü',
  'olea-europaea-leaf-extract': 'Zeytin Yaprağı Özü',
  'hibiscus-sabdariffa-flower-extract': 'Hibiskus Çiçek Özü',
  'punica-granatum-fruit-extract': 'Nar Meyve Özü',
  'vitis-vinifera-seed-extract': 'Üzüm Çekirdek Özü (Resveratrol)',
  'malus-domestica-fruit-cell-extract': 'Elma Kök Hücre Özü',

  // Yüzey aktif ek
  'sodium-laureth-sulfate': 'SLES (Sodyum Lauret Sülfat)',
  'sodium-lauryl-sulfate': 'SLS (Sodyum Lauril Sülfat — Tartışmalı)',
  'sls': 'SLS (Sodyum Lauril Sülfat)',
  'sles': 'SLES (Sodyum Lauret Sülfat)',
  'cocamide-mea': 'Kokoamid MEA',
  'cocamide-dea': 'Kokoamid DEA',

  // Koruyucu ek
  'sorbic-acid': 'Sorbik Asit (Doğal Koruyucu)',
  'potassium-sorbate': 'Potasyum Sorbat (Doğal Koruyucu)',
  'isothiazolinones': 'İzotiyazolinonlar (Tartışmalı Koruyucu)',
  'methylisothiazolinone': 'Metilizotiyazolinon (MIT - Alerjen)',
  'parabens': 'Parabenler (Tartışmalı Koruyucu Grup)',

  // Takviye - vitamin
  'menaquinone-7': 'Menakinon-7 (K2 - MK-7)',
  'cyanocobalamin': 'Siyanokobalamin (B12)',
  'methylcobalamin': 'Metilkobalamin (B12 Aktif Form)',
  'pyridoxal-5-phosphate': 'P-5-P (B6 Aktif Form)',
  'methylfolate': '5-MTHF (Folat Aktif Form)',

  // Takviye - mineraller (çoğul form)
  'magnesium-malate': 'Magnezyum Malat',
  'magnesium-threonate': 'Magnezyum Threonat (Beyne Geçer)',
  'zinc-monomethionine': 'Çinko Monometionin',
  'iron-bisglycinate': 'Demir Bisglisinat',
  'calcium-bisglycinate': 'Kalsiyum Bisglisinat',
  'selenomethionine': 'Selenometionin',

  // Takviye - özel
  'glucosamine-sulfate': 'Glukozamin Sülfat (Eklem)',
  'chondroitin-sulfate': 'Kondroitin Sülfat (Eklem)',
  'msm': 'MSM (Metilsülfonilmetan)',
  'curcumin': 'Kurkumin (Zerdeçal Aktifi)',
  'piperine': 'Piperin (Siyah Biber - Curcumin Sinerji)',
  'resveratrol': 'Resveratrol (Üzüm Antioksidanı)',
  'pterostilbene': 'Pterostilben',
  'lutein': 'Lutein (Göz)',
  'zeaxanthin': 'Zeaksantin (Göz)',
  'astaxanthin': 'Astaksantin (Güçlü Antioksidan)',
  'co-q10': 'CoQ10 (Koenzim Q10)',
  'ubiquinone': 'Ubiquinon (CoQ10 Oksitlenmiş Form)',
  'ubiquinol': 'Ubiquinol (CoQ10 Aktif Form)',
  'pqq': 'PQQ (Pirokinolin Quinone)',
  'nad-nadh': 'NAD+/NADH (Hücre Enerjisi)',

  // Probiyotik suşları
  'lactobacillus-acidophilus': 'Lactobacillus Acidophilus',
  'lactobacillus-rhamnosus': 'Lactobacillus Rhamnosus',
  'lactobacillus-casei': 'Lactobacillus Casei',
  'lactobacillus-plantarum': 'Lactobacillus Plantarum',
  'bifidobacterium-bifidum': 'Bifidobacterium Bifidum',
  'bifidobacterium-longum': 'Bifidobacterium Longum',
  'saccharomyces-boulardii': 'Saccharomyces Boulardii (Maya Probiyotik)',

  // Bitkisel adaptojen
  'panax-ginseng-extract': 'Panax Ginseng Özü',
  'eleutherococcus-senticosus-extract': 'Sibirya Ginsengi Özü',
  'cordyceps-sinensis-extract': 'Cordyceps Mantarı Özü',
  'reishi-mushroom-extract': 'Reishi Mantarı Özü',
  'lions-mane-mushroom-extract': 'Aslan Yele Mantarı Özü',
};

console.log(`[1] Mapping size: ${Object.keys(COMMON_NAMES).length}`);

let updated = 0, skipped = 0;
for (const [slug, name] of Object.entries(COMMON_NAMES)) {
  try {
    const r = await c.query(
      `UPDATE ingredients SET common_name = $2 WHERE ingredient_slug = $1 AND (common_name IS NULL OR common_name = '')`,
      [slug, name]
    );
    if (r.rowCount && r.rowCount > 0) updated++;
    else skipped++;
  } catch (e) { skipped++; }
}
console.log(`[2] Updated: ${updated}, Skipped: ${skipped}`);

const final = await c.query(`SELECT COUNT(*) FILTER (WHERE common_name IS NOT NULL AND common_name <> '') AS full FROM ingredients`);
console.log(`Total ingredients with common_name: ${final.rows[0].full}/5100`);

await c.end();
