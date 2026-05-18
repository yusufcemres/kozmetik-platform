/**
 * Ingredient noise cleanup V2 — surgical UPDATE + ek DELETE
 *
 * 2026-05-18: V1 (eb8fe7c) 19 noise sildi, 17 başarılı.
 * Kalan 365 "EN sentence" + 45 "parantez yarım" çoğu MEŞRU INCI ama içinde
 * yapışmış açıklama cümlesi var. Bunları silmek yerine TEMİZLE.
 *
 * Pattern sınıfları:
 *  (A) Meşru INCI + sonda parantez açıklama  → parantez kesilir
 *      "Tocopherol (Vitamin E, antioksidan)"     → "Tocopherol"
 *  (B) Meşru INCI + sonda EN/FR/ES cümle      → cümle kesilir
 *      "Glycerin Generalmente seguro para..."    → "Glycerin"
 *  (C) Yarım parantez "(" başlangıçlı veya ")" sonlu yamalı
 *      "Aqua (water"                              → "Aqua"
 *  (D) Tamamen açıklama cümlesi (INCI yok)    → DELETE (0 ref ise)
 *      "Generalmente seguro para su uso en cosm" → DELETE
 *
 * GÜVENLİK:
 *  - Sadece ref_count = 0 olan kayıtlar DELETE edilir
 *  - UPDATE'ler önce dry-run'da diff gösterir
 *  - Tek kelime + Latin format korunur (gerçek INCI)
 *
 * Usage:
 *   ts-node clean-noise-ingredients-v2.ts           # dry-run, sadece raporla
 *   ts-node clean-noise-ingredients-v2.ts --run     # uygula
 */
import { newClient } from '../onboarding/db';

const SUFFIX_NOISE_PATTERNS: { name: string; regex: RegExp; replace: string }[] = [
  // Sondaki parantez içi açıklama (en az 5 kelime — kısa parantez = gerçek INCI form)
  { name: 'Sondaki parantez açıklama (5+ kelime)', regex: /\s*\([^)]{30,}\)\s*$/, replace: '' },
  // Yarım açık parantez sondan
  { name: 'Yarım açık parantez sonu',              regex: /\s*\([^)]*$/, replace: '' },
  // Yarım kapalı parantez sondan
  { name: 'Yarım kapalı parantez sonu',            regex: /\s*\)[^(]*$/, replace: '' },
  // EN/FR/ES açıklama cümlesi sondan (3+ ardışık ufak harf kelime)
  { name: 'Sondaki yabancı cümle',                 regex: /\s+(?:[a-zçğıöşü]+\s+){3,}[a-zçğıöşü.,;:!?]+$/u, replace: '' },
  // Trailing punctuation noise
  { name: 'Sondaki noktalama gürültüsü',           regex: /[\s.,;:!?\-]+$/, replace: '' },
];

const FULL_NOISE_PATTERNS: { name: string; regex: RegExp }[] = [
  // Tamamen açıklama cümlesi — INCI Latin format değil
  { name: 'Tam ES cümle', regex: /^(?:generalmente|seguro|para|recomendado|aprobado|según|ambos|esta|conocido)\s/i },
  { name: 'Tam FR cümle', regex: /^(?:le|la|les|cosmétique|peut|recommandé|sans|d.origine|naturelle|certifié|approuvé)\s/i },
  { name: 'Tam EN talimat', regex: /^(?:store|keep|do not|avoid|skin compatibility|dermatologically|may cause|warning|caution)\b/i },
  { name: 'Sadece sayı/ölçü', regex: /^[\d\s.,\-]+$/ },
  { name: 'Adres parça', regex: /\b(?:zagreb|brussels|paris|köln|berlin|istanbul|ankara|izmir)\b/i },
];

function cleanName(raw: string): { cleaned: string; appliedPatterns: string[] } {
  let current = raw;
  const applied: string[] = [];
  for (const p of SUFFIX_NOISE_PATTERNS) {
    const next = current.replace(p.regex, p.replace);
    if (next !== current) {
      applied.push(p.name);
      current = next;
    }
  }
  return { cleaned: current.trim(), appliedPatterns: applied };
}

function isFullNoise(name: string): boolean {
  for (const p of FULL_NOISE_PATTERNS) {
    if (p.regex.test(name)) return true;
  }
  // Yalnız 1 ufak harf kelime + 5+ ardışık kelime sığ olmayan = açıklama cümlesi
  const wordCount = name.split(/\s+/).filter((w) => /[A-Za-zçğıöşü]/.test(w)).length;
  const hasUpperLatin = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/u.test(name); // INCI tipik formu
  if (wordCount >= 6 && !hasUpperLatin) return true;
  return false;
}

async function main(): Promise<void> {
  const dryRun = !process.argv.includes('--run');
  const client = newClient();
  await client.connect();

  console.log(`\n🧹 Noise cleanup V2 — ${dryRun ? 'DRY-RUN' : 'LIVE'}\n`);

  // Tüm 4+ kelime veya parantez içeren ingredient'ları çek
  const candidates = await client.query<{
    ingredient_id: number;
    inci_name: string;
    ingredient_slug: string | null;
    ref_count: number;
  }>(`
    SELECT
      i.ingredient_id, i.inci_name, i.ingredient_slug,
      (SELECT COUNT(*)::int FROM product_ingredients pi WHERE pi.ingredient_id = i.ingredient_id) AS ref_count
    FROM ingredients i
    WHERE
         array_length(string_to_array(i.inci_name, ' '), 1) >= 4
      OR i.inci_name LIKE '%(%'
      OR i.inci_name LIKE '%)%'
    ORDER BY i.ingredient_id
  `);

  console.log(`  Aday kayıt: ${candidates.rows.length}\n`);

  const toUpdate: { id: number; from: string; to: string; patterns: string[]; refs: number }[] = [];
  const toDelete: { id: number; name: string }[] = [];
  const skipped: { id: number; name: string; reason: string }[] = [];

  for (const row of candidates.rows) {
    // Önce tam noise mi?
    if (isFullNoise(row.inci_name)) {
      if (row.ref_count === 0) {
        toDelete.push({ id: row.ingredient_id, name: row.inci_name });
      } else {
        skipped.push({ id: row.ingredient_id, name: row.inci_name, reason: `tam noise ama ${row.ref_count} ref` });
      }
      continue;
    }

    // Yoksa suffix temizleme dene
    const { cleaned, appliedPatterns } = cleanName(row.inci_name);
    if (cleaned !== row.inci_name && cleaned.length >= 3) {
      // Sonuç meşru INCI gibi mi? Min 1 büyük harf veya 3+ harf
      if (/[A-Za-z]{3,}/.test(cleaned)) {
        toUpdate.push({
          id: row.ingredient_id,
          from: row.inci_name,
          to: cleaned,
          patterns: appliedPatterns,
          refs: row.ref_count,
        });
      } else {
        skipped.push({ id: row.ingredient_id, name: row.inci_name, reason: 'clean sonucu çok kısa' });
      }
    }
  }

  console.log(`  ── ÖZET ──`);
  console.log(`  UPDATE adayı: ${toUpdate.length}`);
  console.log(`  DELETE adayı (0 ref): ${toDelete.length}`);
  console.log(`  Atlanan (ref'li tam noise): ${skipped.length}\n`);

  if (toUpdate.length > 0) {
    console.log(`  ── UPDATE örnekleri (ilk 15) ──`);
    for (const u of toUpdate.slice(0, 15)) {
      console.log(`    #${u.id} [${u.refs} ref]`);
      console.log(`      önce : "${u.from.slice(0, 80)}"`);
      console.log(`      sonra: "${u.to.slice(0, 80)}"`);
      console.log(`      pattern: ${u.patterns.join(', ')}`);
    }
    if (toUpdate.length > 15) console.log(`    ... +${toUpdate.length - 15} daha`);
  }

  if (toDelete.length > 0) {
    console.log(`\n  ── DELETE örnekleri (ilk 10) ──`);
    for (const d of toDelete.slice(0, 10)) {
      console.log(`    ✗ #${d.id} "${d.name.slice(0, 80)}"`);
    }
    if (toDelete.length > 10) console.log(`    ... +${toDelete.length - 10} daha`);
  }

  if (skipped.length > 0) {
    console.log(`\n  ── Atlananlar (ilk 5) ──`);
    for (const s of skipped.slice(0, 5)) {
      console.log(`    ⚠ #${s.id} "${s.name.slice(0, 70)}" → ${s.reason}`);
    }
    if (skipped.length > 5) console.log(`    ... +${skipped.length - 5} daha`);
  }

  if (dryRun) {
    console.log(`\n  → --run ile uygulansın`);
    await client.end();
    return;
  }

  // LIVE — TX içinde UPDATE + DELETE
  await client.query('BEGIN');
  try {
    let updated = 0;
    let deleted = 0;

    // Duplicate slug riskini önlemek için UPDATE'ler tek tek
    for (const u of toUpdate) {
      // Hedef name başka bir kayıtta var mı?
      const dup = await client.query<{ ingredient_id: number }>(
        `SELECT ingredient_id FROM ingredients WHERE LOWER(inci_name) = LOWER($1) AND ingredient_id != $2 LIMIT 1`,
        [u.to, u.id],
      );
      if (dup.rows.length > 0) {
        console.log(`  ⚠ #${u.id} → "${u.to}" duplicate (#${dup.rows[0].ingredient_id} ile çakışır), atlanır`);
        continue;
      }
      await client.query(
        `UPDATE ingredients SET inci_name = $1, updated_at = NOW() WHERE ingredient_id = $2`,
        [u.to, u.id],
      );
      updated++;
    }

    if (toDelete.length > 0) {
      const ids = toDelete.map((d) => d.id);
      const del = await client.query(
        `DELETE FROM ingredients WHERE ingredient_id = ANY($1::int[])`,
        [ids],
      );
      deleted = del.rowCount || 0;
    }

    await client.query('COMMIT');
    console.log(`\n  ✓ ${updated} updated, ${deleted} deleted`);

    // Cache invalidate
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && (updated > 0 || deleted > 0)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Redis = require('ioredis');
        const useTls = redisUrl.startsWith('rediss://');
        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3, enableOfflineQueue: false, connectTimeout: 3000,
          ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
        });
        let flushed = 0;
        for (const pattern of ['ingredient:slug:*', 'ingredients:list:*', 'inci:*']) {
          const keys = await redis.keys(pattern);
          if (keys.length) {
            await redis.del(...keys);
            flushed += keys.length;
          }
        }
        await redis.quit();
        console.log(`  ✓ ${flushed} Redis key flushed`);
      } catch (e: any) {
        console.log(`  ⚠ Redis flush atlandı: ${e?.message ?? e}`);
      }
    }
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('❌', e?.stack ?? e);
  process.exit(1);
});
