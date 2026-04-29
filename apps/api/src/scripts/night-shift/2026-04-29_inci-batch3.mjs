/**
 * Faz B — INCI common_name batch 3 (top 80+ ek INCI mapping).
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
  // Modern UV filtreleri
  'bemotrizinol': 'Bemotrizinol (Tinosorb S - Geniş Spektrum UV Filtresi)',
  'tris-biphenyl-triazine': 'Tris-Bifenil Triazin (Tinosorb A2B - UVB+UVA Filtresi)',
  'bis-ethylhexyloxyphenol-methoxyphenyl-triazine': 'Tinosorb S (Bemotrizinol)',
  'diethylamino-hydroxybenzoyl-hexyl-benzoate': 'Uvinul A Plus (UVA Filtresi)',
  'ethylhexyl-triazone': 'Etilheksil Triazon (Uvinul T 150 - UVB Filtresi)',
  'octisalate': 'Oktisalat (Etilheksil Salisilat - UVB Filtresi)',

  // Yüzey aktif maddeler
  'cocamidopropyl-betaine': 'Kokoamidopropil Betain (Yumuşak Yüzey Aktif)',
  'sodium-cocoyl-isethionate': 'Sodyum Kokoil İsetiyonat (Cilt Dostu Temizleyici)',
  'coco-glucoside': 'Koko-Glukozit (Bitkisel Yüzey Aktif)',
  'sodium-cocoyl-glutamate': 'Sodyum Kokoil Glutamat (Aminoasit Bazlı Temizleyici)',
  'sodium-lauroyl-sarcosinate': 'Sodyum Lauroil Sarkosinat (Yumuşak Köpürtücü)',
  'decyl-glucoside': 'Desil-Glukozit (Bitkisel Yumuşak Temizleyici)',
  'lauryl-glucoside': 'Lauril-Glukozit (Bitkisel Yumuşak Temizleyici)',
  'sodium-lauroyl-methyl-isethionate': 'Sodyum Lauroil Metil İsetiyonat (Hassas Temizleyici)',
  'cocamidopropyl-hydroxysultaine': 'Kokoamidopropil Hidroksisultain (Yumuşak Köpürtücü)',
  'coco-betaine': 'Koko-Betain (Bitkisel Yumuşak Köpürtücü)',
  'disodium-cocoyl-glutamate': 'Disodyum Kokoil Glutamat (Aminoasit Temizleyici)',

  // Aktif bileşikler / yenilikçi aktifler
  'adenosine': 'Adenozin (Anti-Aging Aktif)',
  'ectoin': 'Ektoin (Çevresel Stres Koruyucu)',
  'asiaticoside': 'Asiatikozit (Centella Aktif Bileşiği)',
  'phytic-acid': 'Fitik Asit (Aydınlatıcı Antioksidan)',
  'alpha-lipoic-acid': 'Alfa Lipoik Asit (Güçlü Antioksidan)',
  'l-glutathione': 'L-Glutatyon (Hücre İçi Antioksidan)',
  'quercetin': 'Kuersetin (Bitkisel Flavonoid)',

  // Bitki ekstraları
  'schisandra-chinensis-berry-extract': 'Şizandra Çin Hanım Otu Özü',
  'astragalus-membranaceus-extract': 'Astragalus (Kantaron Otu) Özü',
  'rhodiola-rosea-root-extract': 'Altın Kök Özü (Rhodiola)',
  'nelumbo-nucifera-seed-extract': 'Lotus Tohumu Özü',
  'poria-cocos-sclerotium-extract': 'Poria Mantarı Özü',
  'lavandula-angustifolia-oil': 'Lavanta Yağı',
  'citrus-sinensis-peel-oil': 'Tatlı Portakal Kabuk Yağı',
  'citrus-aurantium-dulcis-peel-oil': 'Acı Portakal Kabuk Yağı',
  'citrus-bergamia-peel-oil': 'Bergamot Kabuk Yağı',
  'coptis-japonica-root-extract': 'Coptis Kökü Özü (Geleneksel Kore)',
  'passiflora-incarnata-extract': 'Çarkıfelek (Passiflora) Özü',
  'ashwagandha-extract': 'Ashwagandha Özü (Withania Somnifera)',

  // Peptidler
  'acetyl-tetrapeptide-5': 'Asetil Tetrapeptit-5 (Eyeseryl - Göz Çevresi)',
  'acetyl-octapeptide-3': 'Asetil Oktapeptit-3 (Snap-8 - Mimik Çizgisi)',
  'palmitoyl-tripeptide-5': 'Palmitoil Tripeptit-5 (TGF-β Mimic)',

  // Fermentler
  'saccharomyces-ferment-filtrate': 'Saccharomyces Fermenti (Maya Türevi)',
  'pichiaresveratrol-ferment-extract': 'Pichia/Resveratrol Fermenti',
  'lactococcus-ferment-lysate': 'Lactococcus Fermenti Lizatı',

  // Ceramides + lipidler
  'ceramide-eop': 'Seramid EOP (Bariyer Lipidi)',
  'ceramide-as': 'Seramid AS (Bariyer Lipidi)',
  'ceramide-3': 'Seramid 3 / NP (Bariyer Onarıcı)',
  'glyceryl-stearate': 'Gliseril Stearat (Emülsifiyer)',
  'hydrogenated-lecithin': 'Hidrojene Lesitin (Doğal Emülsifiyer)',
  'hydrogenated-polyisobutene': 'Hidrojene Poliizobüten (Yumuşatıcı)',

  // Aminoasitler ve proteinler
  'glycine': 'Glisin (Amino Asit)',
  'proline': 'Prolin (Kollajen Yapı Taşı)',
  'serine': 'Serin (Amino Asit)',
  'tyrosine': 'Tirozin (Amino Asit)',
  'threonine': 'Treonin (Amino Asit)',
  'alanine': 'Alanin (Amino Asit)',
  'leucine': 'Lösin (Amino Asit)',
  'arginine': 'Arjinin (Amino Asit)',
  'lysine': 'Lizin (Amino Asit)',
  'silk-amino-acids': 'İpek Amino Asitleri (Saç + Cilt)',
  'hydrolyzed-keratin': 'Hidrolize Keratin (Saç Onarıcı)',
  'hydrolyzed-rice-protein': 'Hidrolize Pirinç Proteini',
  'hydrolyzed-silk': 'Hidrolize İpek Proteini',
  'hydrolyzed-wheat-protein': 'Hidrolize Buğday Proteini',
  'hydrolyzed-elastin': 'Hidrolize Elastin',

  // Mineraller (takviye odaklı)
  'chromium-picolinate': 'Krom Pikolinat',
  'copper-gluconate': 'Bakır Glukonat',

  // Diğer popüler
  'caprylyl-glycol': 'Kaprilil Glikol (Nemlendirici / Hafif Koruyucu)',
  'methylpropanediol': 'Metilpropandiol (Solvent + Nemlendirici)',
  'hydroxyethyl-urea': 'Hidroksietil Üre (Yoğun Nemlendirici)',
  'sodium-phytate': 'Sodyum Fitat (Şelat Ajan)',
  'hydroxyacetophenone': 'Hidroksiasetofenon (Antioksidan)',
  'kaolin': 'Kaolin (Beyaz Kil)',
  'sodium-lauroyl-lactylate': 'Sodyum Lauroil Laktilat (Yumuşatıcı)',
  'isoceteth-20': 'İzoseteth-20 (Yüzey Aktif)',
  'benzoic-acid': 'Benzoik Asit (Koruyucu)',
  'chlorphenesin': 'Klorfenezin (Koruyucu)',
  'sodium-citrate': 'Sodyum Sitrat (pH Tampon)',
  'dextrin': 'Dekstrin (Polisakarit)',
  'jojoba-esters': 'Jojoba Esterleri (Hafif Yağ)',
  'phosphatidylserine': 'Fosfatidilserin (Hücre Membranı)',
  'chondroitin-sulfate': 'Kondroitin Sülfat (Eklem Sağlığı)',
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
