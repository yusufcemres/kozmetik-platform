/**
 * Auto-publish (Tier 1) + auto-archive (Tier 3) draft urunler.
 *
 * Tier 1 (PUBLISH): INCI 5+, gorsel 1+, marka var, kategori_id != 1, isim 8+ kar.
 * Tier 3 (ARCHIVE): INCI 0 OR isim < 5 kar OR marka YOK
 * Tier 2 (KEEP DRAFT): orta kalite — admin queue'da kalir
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const DRY = process.argv.includes('--dry');

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

await client.connect();
console.log(`=== Draft auto-publish + archive (dry=${DRY}) ===\n`);

// Tier 1: publish
const tier1Filter = `
  p.status='draft'
  AND p.brand_id IS NOT NULL
  AND p.category_id != 1
  AND LENGTH(p.product_name) >= 8
  AND (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id=p.product_id AND pi.ingredient_id IS NOT NULL) >= 5
  AND (SELECT COUNT(*) FROM product_images pim WHERE pim.product_id=p.product_id) >= 1
`;

// Tier 3: archive
const tier3Filter = `
  p.status='draft'
  AND (
    p.brand_id IS NULL
    OR LENGTH(COALESCE(p.product_name,'')) < 5
    OR (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.product_id=p.product_id AND pi.ingredient_id IS NOT NULL) = 0
  )
`;

const t1Count = (await client.query(`SELECT COUNT(*) FROM products p WHERE ${tier1Filter}`)).rows[0].count;
const t3Count = (await client.query(`SELECT COUNT(*) FROM products p WHERE ${tier3Filter}`)).rows[0].count;
console.log(`Tier 1 (publish): ${t1Count}`);
console.log(`Tier 3 (archive): ${t3Count}\n`);

if (DRY) {
  console.log('DRY mode — no DB writes.');
  await client.end(); process.exit(0);
}

// Tier 1: status='published'
const r1 = await client.query(`
  UPDATE products SET status='published', updated_at=NOW()
  WHERE product_id IN (SELECT p.product_id FROM products p WHERE ${tier1Filter})
`);
console.log(`Published: ${r1.rowCount}`);

// Tier 3: status='archived'
const r3 = await client.query(`
  UPDATE products SET status='archived', updated_at=NOW()
  WHERE product_id IN (SELECT p.product_id FROM products p WHERE ${tier3Filter})
`);
console.log(`Archived: ${r3.rowCount}`);

// Tier 2: kalir (draft)
const remaining = (await client.query(`SELECT COUNT(*) FROM products WHERE status='draft'`)).rows[0].count;
console.log(`\nRemaining draft (Tier 2): ${remaining}`);

await client.end();
