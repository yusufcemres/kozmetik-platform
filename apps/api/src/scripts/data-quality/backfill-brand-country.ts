/**
 * Sprint 2 (#6) — Marka country_of_origin backfill
 *
 * Problem: Türk markaların `country_of_origin` NULL olduğu için `/markalar`
 * sayfasında "Türkiye" chip'i hiç görünmüyor. Bilinen Türk markalar için
 * country_of_origin='TR' set eder. Ek olarak bazı bilinen EU/KR/US markalarını
 * da doldurabilir.
 *
 * Kullanım:
 *   pnpm ts-node src/scripts/data-quality/backfill-brand-country.ts --dry-run
 *   pnpm ts-node src/scripts/data-quality/backfill-brand-country.ts --apply
 */
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: resolve(__dirname, '../../../../../.env') });

type CountryMap = Record<string, string[]>;

// Known Turkish brands (by brand_slug or exact brand_name pattern).
// Source: canlı DB + kullanıcı bildirimi (2026-04-24).
const TR_BRANDS = [
  'bebak', 'dermoskin', 'doa', 'hunca', 'incia', 'marjinal', 'procsin', 'rosense',
  'aromel', 'nuxeri', 'farmasi', 'gratis', 'eczacibasi', 'pharmaceris',
  'nacific', 'siveno', 'niphea', 'thalia', 'atolye-rebul', 'rebul',
  'hobi', 'golden-rose', 'kinetics', 'flormar', 'pastel', 'note',
  'orzax', 'ocean', 'efervit', 'cosakondrin', 'imunol', 'proceive',
  'nutraxin', 'voonka', 'naturals-garden', 'solgar-turkiye',
];

// Additional country classifications — extend as needed.
const COUNTRY_MAP: CountryMap = {
  TR: TR_BRANDS,
  KR: [
    'beauty-of-joseon', 'anua', 'cosrx', 'purito', 'some-by-mi', 'innisfree',
    'laneige', 'skin1004', 'axis-y', 'by-wishtrend', 'benton', 'neogen', 'iunik',
    'sulwhasoo', 'banila-co', 'round-lab', 'tocobo', 'tonymoly',
    'haruharu', 'needly', 'numbuzin', 'mizon', 'dr-jart',
    // 'senka' kaldırıldı — Senka JP (Shiseido markası)
  ],
  JP: [
    'hada-labo', 'biore', 'shiseido', 'senka', 'kose', 'melano-cc', 'curel',
    'minon', 'dr-ci-labo', 'naturie',
  ],
  FR: [
    'vichy', 'la-roche-posay', 'avene', 'bioderma', 'nuxe', 'caudalie',
    'filorga', 'lierac', 'klorane', 'embryolisse', 'ducray', 'svr',
    'noreva', 'uriage',
    // 'rilastil' kaldırıldı — Rilastil IT (Ganassini Group)
  ],
  DE: [
    'eucerin', 'babor', 'dr-hauschka', 'nivea', 'paula-s-choice-de',
    // 'weleda' kaldırıldı — Weleda CH (Swiss origin, 1921)
  ],
  US: [
    'cerave', 'neutrogena', 'aveeno', 'drunk-elephant', 'glow-recipe',
    'farmacy', 'paula-s-choice', 'burt-s-bees',
    'murad', 'kiehl-s', 'first-aid-beauty', 'peter-thomas-roth',
    // 'cetaphil' kaldırıldı — Galderma/CH ama Canada origin; bkz CA
    // 'the-ordinary' kaldırıldı — Deciem, Toronto/CA
    // 'mac' kaldırıldı — MAC Cosmetics Toronto/CA (1984)
  ],
  UK: ['liz-earle', 'the-inkey-list', 'elemis'],
  CA: ['the-ordinary-ca', 'the-ordinary', 'mac', 'cetaphil'],
  IT: ['collistar', 'rilastil'],
  ES: ['sesderma', 'isdin', 'mesoestetic'],
  CH: ['la-prairie', 'weleda'],
  SE: ['foreo', 'estelle-thild'],
  HU: ['helia-d'],
};

interface BrandRow {
  brand_id: number;
  brand_name: string;
  brand_slug: string;
  country_of_origin: string | null;
}

async function main() {
  const args = process.argv.slice(2);
  const applyMode = args.includes('--apply');
  if (!applyMode && !args.includes('--dry-run')) {
    console.error('Usage: ts-node backfill-brand-country.ts [--dry-run | --apply]');
    process.exit(1);
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL missing in .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    // Read current state
    const beforeRes = await client.query<BrandRow>(
      `SELECT brand_id, brand_name, brand_slug, country_of_origin FROM brands ORDER BY brand_slug`,
    );
    const total = beforeRes.rows.length;
    const nullCount = beforeRes.rows.filter((b) => !b.country_of_origin).length;

    console.log(`Total brands: ${total} | NULL country_of_origin: ${nullCount}`);
    console.log('---');

    // Build plan
    const plan: Array<{ brand_id: number; brand_slug: string; current: string | null; target: string }> = [];
    for (const [iso, slugs] of Object.entries(COUNTRY_MAP)) {
      for (const slug of slugs) {
        const brand = beforeRes.rows.find(
          (b) => b.brand_slug === slug || b.brand_name.toLowerCase().replace(/\s+/g, '-') === slug,
        );
        if (brand && brand.country_of_origin !== iso) {
          plan.push({
            brand_id: brand.brand_id,
            brand_slug: brand.brand_slug,
            current: brand.country_of_origin,
            target: iso,
          });
        }
      }
    }

    console.log(`Plan: ${plan.length} brands to update`);
    const byTarget = plan.reduce<Record<string, number>>((acc, p) => {
      acc[p.target] = (acc[p.target] || 0) + 1;
      return acc;
    }, {});
    console.log('By target country:', byTarget);

    if (plan.length === 0) {
      console.log('Nothing to do.');
      return;
    }

    // Preview first 20
    console.log('\nFirst 20 planned updates:');
    for (const p of plan.slice(0, 20)) {
      console.log(`  ${p.brand_slug}: ${p.current ?? 'NULL'} → ${p.target}`);
    }

    if (!applyMode) {
      console.log('\n[DRY-RUN] No changes written. Re-run with --apply to commit.');
      return;
    }

    // Apply
    console.log('\n[APPLY] Updating...');
    await client.query('BEGIN');
    let updated = 0;
    for (const p of plan) {
      await client.query(
        `UPDATE brands SET country_of_origin = $1 WHERE brand_id = $2`,
        [p.target, p.brand_id],
      );
      updated++;
    }
    await client.query('COMMIT');
    console.log(`OK: ${updated} rows updated`);

    // After summary
    const afterRes = await client.query<{ country_of_origin: string | null; count: string }>(
      `SELECT country_of_origin, COUNT(*)::text AS count FROM brands GROUP BY country_of_origin ORDER BY count DESC`,
    );
    console.log('\nFinal distribution:');
    for (const row of afterRes.rows) {
      console.log(`  ${row.country_of_origin ?? 'NULL'}: ${row.count}`);
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Backfill failed:', err);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
