/**
 * Anne-Bebek supplement kategorileri seed.
 *
 * V1 kapsamında sadece supplement domain'ine ekleniyor. Kozmetik bebek
 * ürünleri (şampuan, losyon) V2'de cosmetic onboarding pipeline'ı geldiğinde
 * eklenir.
 *
 * Yetişkin UL/RDA'ya göre skorlanacak (bilinen kısıt). V2'de `target_audience`
 * field + age-adjusted UL tablosu geldiğinde düzeltilecek.
 *
 * Idempotent: UPSERT by category_slug.
 *
 * Run:  node seed-categories-anne-bebek.js [--dry-run]
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

const CATEGORIES = [
  { slug: 'hamile-takviyeleri',  name: 'Hamile Takviyeleri',              domain_type: 'supplement', sort_order: 50 },
  { slug: 'emzirme-takviyeleri', name: 'Emzirme Takviyeleri',             domain_type: 'supplement', sort_order: 51 },
  { slug: 'bebek-vitaminleri',   name: 'Bebek Vitaminleri (0-12 ay)',     domain_type: 'supplement', sort_order: 52 },
  { slug: 'cocuk-vitaminleri',   name: 'Çocuk Vitaminleri (1-12 yaş)',    domain_type: 'supplement', sort_order: 53 },
];

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  let inserted = 0, updated = 0;
  try {
    for (const c of CATEGORIES) {
      if (DRY) { console.log(`  [DRY] ${c.slug} → ${c.name} (${c.domain_type})`); continue; }
      const res = await client.query(
        `INSERT INTO categories (category_name, category_slug, domain_type, sort_order, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (category_slug) DO UPDATE SET
           category_name = EXCLUDED.category_name,
           domain_type   = EXCLUDED.domain_type,
           sort_order    = EXCLUDED.sort_order,
           is_active     = true,
           updated_at    = now()
         RETURNING (xmax = 0) AS inserted`,
        [c.name, c.slug, c.domain_type, c.sort_order],
      );
      if (res.rows[0].inserted) { console.log(`  [INS] ${c.slug}`); inserted++; }
      else { console.log(`  [UPD] ${c.slug}`); updated++; }
    }
  } finally {
    await client.end();
  }
  console.log(`\n=== Summary ===\n  inserted = ${inserted}\n  updated  = ${updated}\n  total    = ${CATEGORIES.length}`);
}

main().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
