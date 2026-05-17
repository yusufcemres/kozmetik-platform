/**
 * Ingredient noise cleanup — yüksek güvenli scrape artifact'leri sil.
 *
 * 2026-05-18: ingredient-noise-stats.ts audit raporu sonrası:
 *   - 8 sadece sayı (telefon numarası: 0639312644, 033 778 400, vb.)
 *   - 3 FR cümle (1 % d'ingrédients d'origine naturelle...)
 *   - 8 Website/URL parçası (Www.pg.com, ...)
 *   = 19 yüksek güven noise
 *
 * GÜVENLİK: Bağlı product_ingredients varsa silme bloklanır (FK kısıtlaması).
 * Sadece zero-reference olanları sil; refed varsa CSV'e dump et manuel review için.
 *
 * Usage:
 *   ts-node delete-noise-ingredients.ts           # dry-run
 *   ts-node delete-noise-ingredients.ts --run     # uygula
 */
import { newClient } from '../onboarding/db';

const NOISE_QUERY = `
  SELECT
    i.ingredient_id, i.inci_name, i.ingredient_slug,
    (SELECT COUNT(*)::int FROM product_ingredients pi WHERE pi.ingredient_id = i.ingredient_id) AS ref_count
  FROM ingredients i
  WHERE
       i.inci_name ~* '^[0-9 .,\\-]+$'                                    -- 0639312644, 033 778 400
    OR i.inci_name ~* '^0[78][0-9]{8,}$'                                  -- telefon
    OR i.inci_name ~* '^[0-9., ]+ ?(mg|ml|g|kg|l|ppb|fl|oz|mcg)\\b'       -- 000 ppb, 0.40 fl
    OR i.inci_name ~* '(www\\.|http|\\.com|\\.tr)'                        -- website
    OR i.inci_name ~* '(d.origine|sans huile|sans silicone|naturelle\\.)' -- FR cümle
    OR i.inci_name ~* 'Generalmente seguro|para su uso en cosm'           -- ES cümle
    OR i.inci_name ~* 'Cosmétique Ecologique|certifié par Ecocert'        -- FR sertifika cümlesi
    OR i.inci_name ~* 'Store below|skin compatibility dermatologically'   -- EN talimat cümle
  ORDER BY i.ingredient_id
`;

async function main(): Promise<void> {
  const dryRun = !process.argv.includes('--run');
  const client = newClient();
  await client.connect();

  console.log(`\n🗑️ Noise ingredient cleanup — ${dryRun ? 'DRY-RUN' : 'LIVE'}\n`);

  const res = await client.query<{
    ingredient_id: number;
    inci_name: string;
    ingredient_slug: string | null;
    ref_count: number;
  }>(NOISE_QUERY);

  const safeToDelete = res.rows.filter((r) => r.ref_count === 0);
  const referenced = res.rows.filter((r) => r.ref_count > 0);

  console.log(`  Toplam noise: ${res.rows.length}`);
  console.log(`  Güvenli silme (0 ref): ${safeToDelete.length}`);
  console.log(`  Ürünle bağlı (manuel review): ${referenced.length}\n`);

  if (safeToDelete.length > 0) {
    console.log('  --- Silinecekler ---');
    for (const r of safeToDelete) {
      console.log(`    ✗ #${r.ingredient_id} "${r.inci_name.slice(0, 60)}"`);
    }
    if (!dryRun) {
      const ids = safeToDelete.map((r) => r.ingredient_id);
      const del = await client.query(
        `DELETE FROM ingredients WHERE ingredient_id = ANY($1::int[])`,
        [ids],
      );
      console.log(`\n  ✓ ${del.rowCount} ingredient silindi`);
    }
  }

  if (referenced.length > 0) {
    console.log('\n  --- Ürünle bağlı (silinmedi) ---');
    for (const r of referenced) {
      console.log(`    ⚠ #${r.ingredient_id} "${r.inci_name.slice(0, 60)}" (${r.ref_count} ref)`);
    }
    console.log(`\n  → Bu kayıtlar product_ingredients'tan unbind edilmeli, sonra silinebilir.`);
  }

  // Cache invalidate
  if (!dryRun && safeToDelete.length > 0) {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Redis = require('ioredis');
        const useTls = redisUrl.startsWith('rediss://');
        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3, enableOfflineQueue: false, connectTimeout: 3000,
          ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
        });
        for (const pattern of ['ingredient:slug:*', 'ingredients:list:*']) {
          const keys = await redis.keys(pattern);
          if (keys.length) await redis.del(...keys);
        }
        await redis.quit();
      } catch {}
    }
  }

  await client.end();
}

main().catch((e) => {
  console.error('❌', e?.stack ?? e);
  process.exit(1);
});
