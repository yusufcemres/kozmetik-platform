/**
 * Top INCI mekanistik içerik üretimi (1500+ kelime, atıflı):
 * Hyaluronic Acid template yapısıyla — Mekanizma + Etkili Konsantrasyon
 * + Kanıt + Hassasiyet + Kaynaklar
 *
 * Usage: node src/scripts/data-quality/enrich-top-inci-descriptions.mjs [--limit N] [--dry]
 */
import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : 60;
const DRY = args.includes('--dry');
const PARALLEL = 4;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable required');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

async function generateDescription(inci) {
  const prompt = `Sen bir kozmetik kimyageri ve dermatologsun. Aşağıdaki INCI bileşeni için Türkçe markdown formatında 1500-2000 kelimelik bilimsel, atıflı, derinlemesine bir içerik yaz. Format Hyaluronik Asit referans örneğindeki gibi olmalı.

INCI: ${inci.inci_name}
Türkçe ad: ${inci.common_name || '-'}
Grup: ${inci.ingredient_group || '-'}
Fonksiyon özeti: ${inci.function_summary || '-'}
Evidence grade: ${inci.evidence_grade || '-'}
CIR durumu: ${inci.cir_status || '-'}
Alerjen flag: ${inci.allergen_flag}
Parfüm flag: ${inci.fragrance_flag}

YAZIM KURALLARI:
- Türkçe, profesyonel ama anlaşılır
- Mutlaka bu yapı:
  - Açılış: 2-3 cümle (bileşenin ne olduğu, kökeni, ana kullanım amacı)
  - ## Mekanizma — moleküler/fizyolojik etki nasıl çalışır (200-300 kelime)
  - ## Etkili Konsantrasyon — tipik aralık + literatürdeki etkin doz (150-250 kelime)
  - ## Kullanım Tüyoları — pratik öneriler, kombinasyon kuralları, hangi cilt tipine uygun (200-300 kelime)
  - ## Kanıt — somut çalışma referansları yazar+yıl+dergi formatında (3-5 RCT/sistematik derleme/CIR, 200-300 kelime)
  - ## Hassasiyet ve Uyumluluk — kim kullanmamalı, hangi bileşenlerle çakışır (100-200 kelime)
  - ## Kaynaklar — CIR / SCCS / PubMed / INCI Decoder satır listesi (5-8 kaynak)
- "claim" değil "kanıt" odaklı, abartısız
- Çalışma adı + yıl + dergi şeklinde atıflar (örn. "Bissett et al. 2005 — niacinamide hiperpigmentasyon, J Cosmet Dermatol")
- Markdown başlıklar ## seviyesinde, italik/bold normal kullan
- Türkçe karakter (ş ç ğ ü ö ı) doğru
- Greenwashing yok, somut bilgi

Sadece markdown içerik döndür, hiçbir önsöz/kapanış ekleme. **Bileşen Adı** ile başla.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic ${response.status}: ${err.substring(0, 200)}`);
  }
  const data = await response.json();
  return data.content[0].text;
}

await client.connect();
console.log(`=== Top INCI içerik zenginleştirme (limit=${LIMIT}, dry=${DRY}, parallel=${PARALLEL}) ===\n`);

const { rows: targets } = await client.query(`
  WITH top_inci AS (
    SELECT i.ingredient_id, i.inci_name, i.common_name, i.ingredient_group,
           i.evidence_grade, i.cir_status, i.function_summary,
           i.allergen_flag, i.fragrance_flag,
           LENGTH(COALESCE(i.detailed_description, '')) AS desc_len,
           COUNT(DISTINCT pi.product_id) AS usage
    FROM ingredients i
    LEFT JOIN product_ingredients pi ON pi.ingredient_id = i.ingredient_id
    WHERE i.is_active = true
    GROUP BY i.ingredient_id
    ORDER BY usage DESC
    LIMIT 100
  )
  SELECT * FROM top_inci WHERE desc_len < 500
  ORDER BY usage DESC LIMIT $1
`, [LIMIT]);

console.log(`Target INCI count: ${targets.length}\n`);

let success = 0;
let failed = 0;

// Batch process with PARALLEL
for (let i = 0; i < targets.length; i += PARALLEL) {
  const chunk = targets.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(async (inci) => {
    try {
      const desc = await generateDescription(inci);
      if (!DRY) {
        await client.query(
          `UPDATE ingredients SET detailed_description = $1, updated_at = NOW() WHERE ingredient_id = $2`,
          [desc, inci.ingredient_id]
        );
      }
      return { id: inci.ingredient_id, name: inci.inci_name, len: desc.length };
    } catch (e) {
      throw { id: inci.ingredient_id, name: inci.inci_name, error: e.message };
    }
  }));

  for (const r of results) {
    if (r.status === 'fulfilled') {
      success++;
      console.log(`✓ [${success}/${targets.length}] #${r.value.id} ${r.value.name} (${r.value.len} chars)`);
    } else {
      failed++;
      console.log(`✗ #${r.reason?.id} ${r.reason?.name}: ${r.reason?.error}`);
    }
  }
}

console.log(`\n=== Done: ${success} success, ${failed} failed ===`);
await client.end();
