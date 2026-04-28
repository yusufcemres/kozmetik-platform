/**
 * Faz 1.5d — Top 50 ek INCI için Türkçe common_name seed (batch 2).
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
  // Aktifler ek
  'azelaic-acid': 'Azelaik Asit',
  'kojic-acid': 'Kojik Asit',
  'tranexamic-acid': 'Traneksamik Asit',
  'arbutin': 'Arbutin',
  'alpha-arbutin': 'Alfa Arbutin',
  'resorcinol': 'Resorsinol',
  'bakuchiol': 'Bakuçiol (Doğal Retinol Alternatifi)',
  'retinaldehyde': 'Retinaldehit (Aktif A Vit. Türevi)',
  'tretinoin': 'Tretinoin (Reçeteli Retinoid)',
  'adapalene': 'Adapalen (Sentetik Retinoid)',
  'glycolic-acid': 'Glikolik Asit (AHA)',
  'lactic-acid': 'Laktik Asit (AHA)',
  'mandelic-acid': 'Mandelik Asit (AHA)',
  'malic-acid': 'Malik Asit (AHA)',
  'tartaric-acid': 'Tartarik Asit',
  'gluconolactone': 'Glukonolakton (PHA)',
  'lactobionic-acid': 'Laktobiyonik Asit (PHA)',

  // Peptidler
  'palmitoyl-tripeptide-1': 'Palmitoil Tripeptit-1',
  'palmitoyl-pentapeptide-4': 'Matrixyl (Palmitoil Pentapeptit-4)',
  'acetyl-hexapeptide-8': 'Argireline (Asetil Heksapeptit-8)',
  'copper-tripeptide-1': 'Bakır Peptit GHK-Cu',
  'palmitoyl-tetrapeptide-7': 'Palmitoil Tetrapeptit-7',

  // Yağlar / besleyiciler
  'squalane': 'Skualan (Bitkisel)',
  'squalene': 'Skualen',
  'shea-butter': 'Shea Yağı',
  'butyrospermum-parkii-butter': 'Shea Yağı',
  'argania-spinosa-kernel-oil': 'Argan Yağı',
  'rosa-canina-fruit-oil': 'Kuşburnu Yağı (Rosehip)',
  'simmondsia-chinensis-seed-oil': 'Jojoba Yağı',
  'helianthus-annuus-seed-oil': 'Ayçiçek Yağı',
  'olea-europaea-fruit-oil': 'Zeytin Yağı',
  'cocos-nucifera-oil': 'Hindistan Cevizi Yağı',
  'macadamia-ternifolia-seed-oil': 'Makadamya Yağı',
  'avocado-oil': 'Avokado Yağı',

  // Çoğul aktif
  'urea': 'Üre',
  'lactobacillus-ferment': 'Laktobasillus Fermenti',
  'galactomyces-ferment-filtrate': 'Galaktomis Fermenti (Pitera)',
  'bifida-ferment-lysate': 'Bifida Fermenti',
  'snail-secretion-filtrate': 'Salyangoz Salgısı',

  // Diğer
  'witch-hazel': 'Cadı Fındığı',
  'rose-water': 'Gül Suyu',
  'tea-tree-oil': 'Çay Ağacı Yağı',
  'melaleuca-alternifolia-leaf-oil': 'Çay Ağacı Yağı',

  // Vitamin/mineral takviye
  'cobalamin': 'B12 Vitamini',
  'thiamine': 'B1 Vitamini',
  'riboflavin': 'B2 Vitamini',
  'pantothenic-acid': 'B5 Vitamini (Pantotenik Asit)',
  'pyridoxine': 'B6 Vitamini',
  'folate': 'Folat (B9)',
  'vitamin-k': 'K Vitamini',
  'menaquinone': 'Menakinon (K2)',
  'phylloquinone': 'Filokinon (K1)',

  // Mineraller
  'magnesium': 'Magnezyum',
  'calcium': 'Kalsiyum',
  'iron': 'Demir',
  'iodine': 'İyot',
  'selenium': 'Selenyum',
  'chromium': 'Krom',
  'molybdenum': 'Molibden',
  'manganese': 'Manganez',
  'potassium': 'Potasyum',
  'phosphorus': 'Fosfor',

  // Aminoasit
  'l-arginine': 'L-Arjinin',
  'l-glutamine': 'L-Glutamin',
  'l-tyrosine': 'L-Tirozin',
  'l-tryptophan': 'L-Triptofan',
  'l-carnitine': 'L-Karnitin',
  'taurine': 'Taurin',
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
