/**
 * Target audience backfill — ürünleri kategori + ad heuristiği ile sınıflandır.
 *
 * 2026-05-17: CeraVe Baby Moisturizing Lotion gibi bebek ürünleri `target_audience='adult'`
 * olarak işaretlendiği için yetişkin ihtiyaçlarına göre skorlanıyor (Sivilce/Akne top_need
 * gösterilmesi gibi yanlış sonuçlar). Bu script kategori + isim pattern'ine göre bebek/çocuk
 * ürünlerini doğru audience'a çekiyor.
 *
 * Tüm değerler: 'adult' | 'pregnant' | 'breastfeeding' | 'infant_0_12m' | 'child_1_3y' | 'child_4_12y'
 *
 * Idempotent: zaten doğru sınıflanmış ürünleri atlar, sadece NULL veya yanlış olanları günceller.
 *
 * Usage:
 *   ts-node classify-target-audience.ts            # dry-run
 *   ts-node classify-target-audience.ts --run      # uygula
 */
import { newClient } from '../onboarding/db';

type AudienceRule = {
  audience: 'infant_0_12m' | 'child_4_12y' | 'pregnant';
  categoryPatterns: string[]; // ILIKE patterns
  namePatterns: string[];
};

const RULES: AudienceRule[] = [
  {
    audience: 'infant_0_12m',
    categoryPatterns: ['%bebek%'],
    namePatterns: ['%baby%', '%bebek%', '%infant%', '%newborn%', '%yenidoğan%'],
  },
  {
    audience: 'child_4_12y',
    categoryPatterns: ['%çocuk%', '%cocuk%'],
    namePatterns: ['%kids%', '%child%', '%çocuk%', '%cocuk%'],
  },
  {
    audience: 'pregnant',
    categoryPatterns: ['%hamile%', '%gebe%', '%emzir%'],
    namePatterns: ['%hamile%', '%gebe%', '%pregnancy%', '%emzir%', '%maternity%'],
  },
];

async function main(): Promise<void> {
  const dryRun = !process.argv.includes('--run');
  const client = newClient();
  await client.connect();

  console.log(`\n👶 target_audience backfill — ${dryRun ? 'DRY-RUN' : 'LIVE'}\n`);

  let totalUpdated = 0;
  let totalMatched = 0;

  for (const rule of RULES) {
    const orClauses: string[] = [];
    const params: string[] = [];
    let idx = 1;

    for (const p of rule.categoryPatterns) {
      orClauses.push(`c.category_name ILIKE $${idx}`);
      params.push(p);
      idx++;
    }
    for (const p of rule.namePatterns) {
      orClauses.push(`p.product_name ILIKE $${idx}`);
      params.push(p);
      idx++;
    }

    // Sınıflandırılacak ürünleri bul (audience zaten doğru olanları skip et)
    const query = `
      SELECT p.product_id, p.product_slug, p.product_name, p.target_audience, c.category_name
      FROM products p
      LEFT JOIN categories c ON c.category_id = p.category_id
      WHERE (${orClauses.join(' OR ')})
        AND (p.target_audience IS NULL OR p.target_audience != $${idx})
        AND p.status = 'published'
      ORDER BY p.product_id
    `;
    params.push(rule.audience);

    const res = await client.query(query, params);
    totalMatched += res.rows.length;

    console.log(`  ▶ ${rule.audience.padEnd(15)} → ${res.rows.length} ürün eşleşti`);
    if (res.rows.length > 0 && res.rows.length <= 5) {
      for (const row of res.rows) {
        console.log(`      • [${row.target_audience || 'NULL'}→${rule.audience}] ${row.product_name.slice(0, 60)} (${row.category_name || 'no-cat'})`);
      }
    } else if (res.rows.length > 5) {
      for (const row of res.rows.slice(0, 3)) {
        console.log(`      • ${row.product_name.slice(0, 60)}`);
      }
      console.log(`      ... +${res.rows.length - 3} daha`);
    }

    if (!dryRun && res.rows.length > 0) {
      const ids = res.rows.map((r) => r.product_id);
      const updateRes = await client.query(
        `UPDATE products SET target_audience = $1, updated_at = NOW()
         WHERE product_id = ANY($2::int[])`,
        [rule.audience, ids],
      );
      totalUpdated += updateRes.rowCount || 0;
      console.log(`      ✓ ${updateRes.rowCount} ürün güncellendi`);
    }
  }

  console.log(`\n  Toplam: ${totalMatched} eşleşme, ${dryRun ? '0 (DRY)' : totalUpdated} güncellendi.\n`);

  // Cache invalidate (food_sources backfill ile aynı pattern)
  if (!dryRun && totalUpdated > 0) {
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
          commandTimeout: 2000,
          ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
        });
        for (const pattern of ['product:slug:*', 'supplement:slug:*']) {
          const keys = await redis.keys(pattern);
          if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`  🗑️  Cache invalidated: ${pattern} (${keys.length} key)`);
          }
        }
        await redis.quit();
      } catch (err: any) {
        console.log(`  ⚠️  Cache invalidate fail: ${err.message}`);
      }
    }
  }

  await client.end();
}

main().catch((e) => {
  console.error('❌', e?.stack ?? e);
  process.exit(1);
});
