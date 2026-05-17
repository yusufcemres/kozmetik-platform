/**
 * Need FAQ batch generator — Claude API ile her need için 25 SSS üretir,
 * needs.faq_json kolonuna seed eder.
 *
 * 2026-05-17: Mevcut state 24 need × 3 SSS = 72 toplam. Hedef 24 × 25 = 600.
 * Manuel yazım 12+ saat sürer; bu script Claude Sonnet 4.6 ile structured JSON
 * generate eder + DB'ye yazar. Maliyet ~$0.50 toplam.
 *
 * Usage:
 *   ts-node generate-need-faqs.ts                          # dry-run, all needs
 *   ts-node generate-need-faqs.ts --slug=bariyer-destegi   # tek need test
 *   ts-node generate-need-faqs.ts --run                    # uygula
 *   ts-node generate-need-faqs.ts --slug=X --run           # tek need uygula
 */
import { newClient } from '../onboarding/db';

const TARGET_COUNT = 25;
const CLAUDE_TIMEOUT_MS = 120_000; // 25 SSS Türkçe ~3500 token, Sonnet 4.6 ~60sn

const SYSTEM_PROMPT = `Sen REVELA Türkiye için cilt bakımı + takviye uzmanı içerik editörüsün.
Kullanıcının cilt/sağlık ihtiyacı hakkında 25 farklı SSS (sıkça sorulan soru) üreteceksin.

KURALLAR:
1. Her soru SAMİMİ + günlük dilde, tıbbi jargon yok ama bilimsel doğru
2. Cevap 2-4 cümle, max 60 kelime — kısa öz pratik
3. Çeşitli kategoriler dağıtılsın: temel kavram (5) + aktif madde önerisi (5) + rutin/kullanım (5) + cilt tipi varyasyonu (5) + durum bazlı (5)
4. Tıbbi tanı koyma, "doktor/dermatologa danış" durumları belirt
5. Marka adı geçirme; jenerik INCI veya aktif madde isimleri OK (örn. Niacinamide, Retinol, BHA)
6. Garanti verme ('kesin geçer', 'X günde düzelir' yasak)

ÇIKTI FORMAT: SADECE valid JSON array, başka metin yok:
[
  {"q": "Soru?", "a": "Cevap."},
  {"q": "Soru?", "a": "Cevap."},
  ... (toplam 25 madde)
]

Hiç markdown, hiç açıklama, sadece JSON array.`;

async function generateFaqsForNeed(
  needName: string,
  needDescription: string,
  domain: string,
  apiKey: string,
): Promise<Array<{ q: string; a: string }> | null> {
  const userPrompt = `İhtiyaç: "${needName}" (${domain})
Açıklama: ${needDescription || 'Açıklama yok'}

Bu ihtiyaç için ${TARGET_COUNT} sıkça sorulan soru-cevap üret. JSON array formatında.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(CLAUDE_TIMEOUT_MS),
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`  ✗ Claude ${res.status}: ${text.slice(0, 200)}`);
      return null;
    }
    const json = (await res.json()) as { content?: Array<{ text?: string }> };
    let raw = json?.content?.[0]?.text?.trim() ?? '';
    // Markdown code fence temizle (Claude bazen ekler)
    raw = raw.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error('  ✗ JSON array değil');
      return null;
    }
    const valid = parsed.filter(
      (x) => x && typeof x.q === 'string' && typeof x.a === 'string',
    );
    return valid;
  } catch (err: any) {
    console.error(`  ✗ ${err.message}`);
    return null;
  }
}

async function main(): Promise<void> {
  const dryRun = !process.argv.includes('--run');
  const slugFilter = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY env yok');
    process.exit(1);
  }

  const client = newClient();
  await client.connect();

  console.log(`\n📝 Need FAQ batch generator — ${dryRun ? 'DRY-RUN' : 'LIVE'}\n`);
  if (slugFilter) console.log(`  Filter: slug=${slugFilter}\n`);

  // Hedef need'leri çek (mevcut faq_json az veya boş olanlar)
  const where = slugFilter
    ? `WHERE need_slug = '${slugFilter.replace(/'/g, "''")}'`
    : `WHERE jsonb_array_length(COALESCE(faq_json, '[]'::jsonb)) < 10`;

  const res = await client.query(
    `SELECT need_id, need_slug, need_name, short_description, domain_type,
            jsonb_array_length(COALESCE(faq_json, '[]'::jsonb)) AS existing_count
     FROM needs ${where}
     ORDER BY need_id`,
  );

  console.log(`  Hedef need sayısı: ${res.rows.length}\n`);

  let updated = 0;
  let failed = 0;

  for (const need of res.rows) {
    process.stdout.write(`  ▶ ${need.need_slug.padEnd(35)} (${need.existing_count} mevcut) … `);
    if (dryRun) {
      console.log('SKIP (dry-run)');
      continue;
    }
    const faqs = await generateFaqsForNeed(
      need.need_name,
      need.short_description || '',
      need.domain_type || 'cilt',
      apiKey,
    );
    if (!faqs || faqs.length < 15) {
      console.log(`✗ üretemedi (${faqs?.length ?? 0})`);
      failed++;
      continue;
    }
    await client.query(
      `UPDATE needs SET faq_json = $1::jsonb, updated_at = NOW() WHERE need_id = $2`,
      [JSON.stringify(faqs), need.need_id],
    );
    console.log(`✓ ${faqs.length} SSS yazıldı`);
    updated++;
    // Rate limit — Claude API saniyede 1 istek tolere ediyor, biz 1.5sn bekleyelim
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n  ${updated} need güncellendi, ${failed} fail.\n`);

  // Cache invalidate
  if (!dryRun && updated > 0) {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Redis = require('ioredis');
        const useTls = redisUrl.startsWith('rediss://');
        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
          connectTimeout: 3000,
          ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
        });
        for (const pattern of ['need:slug:*', 'needs:list:*']) {
          const keys = await redis.keys(pattern);
          if (keys.length) {
            await redis.del(...keys);
            console.log(`  🗑️ Cache: ${pattern} (${keys.length})`);
          }
        }
        await redis.quit();
      } catch (e: any) {
        console.log(`  ⚠️ Cache fail: ${e.message}`);
      }
    }
  }

  await client.end();
}

main().catch((e) => {
  console.error('❌', e?.stack ?? e);
  process.exit(1);
});
