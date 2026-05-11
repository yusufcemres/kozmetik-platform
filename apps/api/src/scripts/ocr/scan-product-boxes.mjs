/**
 * Ürün kutusu fotoğraflarından yapılandırılmış veri çıkarıcı.
 *
 * - Anthropic Vision (Claude Sonnet 4.5) kullanır
 * - Bir klasördeki tüm .jpg/.png dosyalarını işler
 * - Her foto için JSON kaydeder (output/<image>.json)
 * - DRY mode'da DB'ye yazmaz; --apply ile DB enrichment
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node src/scripts/ocr/scan-product-boxes.mjs \
 *     --input="C:/Users/Yusuf Cemre/OneDrive/Desktop/ürün kutulari" \
 *     --output=./tmp/ocr-results \
 *     --limit=5
 */
import { readdir, readFile, writeFile, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname, join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable required');
  process.exit(1);
}

const args = process.argv.slice(2);
function arg(name, def = null) {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=').slice(1).join('=') : def;
}

const INPUT = arg('input', '');
const OUTPUT = arg('output', './tmp/ocr-results');
const LIMIT = parseInt(arg('limit', '0'), 10) || 0;
const PARALLEL = parseInt(arg('parallel', '3'), 10);

if (!INPUT) {
  console.error('--input=<path> required');
  process.exit(1);
}

const EXTRACTION_PROMPT = `Sen Türkçe + İngilizce kozmetik / takviye ürün kutusu fotoğraflarını analiz eden bir OCR uzmanısın.

Aşağıdaki fotoğrafta bir ürün kutusu var. SADECE görsel olarak okuyabildiğin bilgileri çıkar. Tahmin etme, eksik bilgi varsa null bırak.

JSON çıktısı (sadece JSON, başka metin yok):

{
  "image_role": "front" | "back" | "side" | "barcode_panel" | "ingredients_panel" | "full_flat" | "unknown",
  "brand_name": "EYÜP SABRİ TUNCER" tarzı orijinal yazımı,
  "product_name": "Doğal Propolis Özlü Diş Macunu" tam ad,
  "product_type": "diş macunu" | "şampuan" | "krem" | "serum" | "sabun" | "takviye" vb.,
  "barcode": "8691685016503" sadece rakam,
  "volume": { "value": 75, "unit": "ml" | "g" | "kapsül" | "tablet" },
  "made_in": "Turkey",
  "producer": {
    "name": "E.S.T. EYÜP SABRİ TUNCER KOZMETİK SANAYİ A.Ş.",
    "address": "Vadistanbul ofis blok...",
    "phone": "+90 212 469 80 80",
    "website": "www.eyupsabrituncer.com"
  },
  "dates": {
    "production_date": "08/2020 veya 2020-08 formatında",
    "expiry_date": "02/2023",
    "pao_months": 12 (PAO = period after opening, "12 M" varsa),
    "batch_code": "586"
  },
  "claims": ["No SLS", "No Fluoride", "Vegetarian", "Gluten-free", "Cruelty-free"] dahil türev tüm beyanlar,
  "usage_instructions": "Kullanım talimatı bölümünden tam metin",
  "warnings": "Uyarılar bölümünden tam metin",
  "ingredients_raw": "İçindekiler / Ingredients: sonrası ham metin (varsa)",
  "ingredients_list": ["Sorbitol", "Aqua", "Calcium Carbonate", ...] virgülle ayrılmış INCI parsed liste,
  "key_actives": ["Propolis Extract", "Thymol"] ön planda gösterilen aktif maddeler,
  "certifications": ["EUROPEAN VEGETARIAN UNION", "GMP", "ISO"] sertifika rozetleri,
  "free_of_warnings": ["SLS", "Florür", "Titanium Dioxide", "Paraben", "Boya", "Gluten", "Şeker", "Tuz"] "içermez" beyanları,
  "languages_detected": ["tr", "en"]
}

Görmediklerin için null veya boş array bırak. Okumakta tereddütlü değer için confidence sayma — sadece net okuduğunu yaz. Sadece JSON döndür, başka açıklama ekleme.`;

// 5MB Anthropic limit — büyük fotolar için Jimp ile resize
const MAX_IMAGE_BYTES = 4_900_000;

async function readImageBase64(imagePath) {
  let buf = await readFile(imagePath);
  if (buf.length > MAX_IMAGE_BYTES) {
    try {
      const { Jimp } = await import('jimp');
      const img = await Jimp.read(buf);
      // 1600px max width + kademeli kalite düşür
      const targetWidth = Math.min(img.width, 1600);
      img.resize({ w: targetWidth });
      let quality = 80;
      let out = await img.getBuffer('image/jpeg', { quality });
      while (out.length > MAX_IMAGE_BYTES && quality >= 40) {
        quality -= 15;
        out = await img.getBuffer('image/jpeg', { quality });
      }
      buf = out;
    } catch (e) {
      throw new Error(`Image >5MB resize failed: ${e.message}`);
    }
  }
  return buf.toString('base64');
}

async function extractFromImage(imagePath) {
  const base64 = await readImageBase64(imagePath);
  const ext = extname(imagePath).slice(1).toLowerCase();
  const mediaType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: EXTRACTION_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Anthropic ${response.status}: ${txt.substring(0, 200)}`);
  }
  const data = await response.json();
  const text = data.content[0].text;

  // Extract JSON from markdown code fence if present
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error('No JSON in response: ' + text.substring(0, 200));
  return JSON.parse(jsonMatch[1]);
}

async function main() {
  const files = (await readdir(INPUT))
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();
  const targets = LIMIT > 0 ? files.slice(0, LIMIT) : files;

  console.log(`=== Vision OCR ===`);
  console.log(`Input:    ${INPUT}`);
  console.log(`Found:    ${files.length} images`);
  console.log(`Target:   ${targets.length}`);
  console.log(`Parallel: ${PARALLEL}`);
  console.log();

  if (!existsSync(OUTPUT)) await mkdir(OUTPUT, { recursive: true });

  let success = 0, failed = 0;
  for (let i = 0; i < targets.length; i += PARALLEL) {
    const chunk = targets.slice(i, i + PARALLEL);
    const results = await Promise.allSettled(
      chunk.map(async (filename) => {
        const fullPath = join(INPUT, filename);
        const outFile = join(OUTPUT, `${basename(filename, extname(filename))}.json`);
        if (existsSync(outFile)) {
          return { filename, skipped: true };
        }
        const extracted = await extractFromImage(fullPath);
        const wrapped = {
          source_file: filename,
          extracted_at: new Date().toISOString(),
          model: 'claude-sonnet-4-5',
          ...extracted,
        };
        await writeFile(outFile, JSON.stringify(wrapped, null, 2), 'utf-8');
        return { filename, brand: extracted.brand_name, product: extracted.product_name, barcode: extracted.barcode, role: extracted.image_role };
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled') {
        success++;
        const v = r.value;
        if (v.skipped) console.log(`⊘ ${v.filename} (cached)`);
        else console.log(`✓ ${v.filename} | ${v.role} | ${v.brand || '?'} | ${v.product || '?'} | ${v.barcode || '?'}`);
      } else {
        failed++;
        console.log(`✗ ${r.reason?.message || r.reason}`);
      }
    }
  }
  console.log(`\n=== Done: ${success} ok, ${failed} fail ===`);
}

main().catch((e) => { console.error(e); process.exit(1); });
