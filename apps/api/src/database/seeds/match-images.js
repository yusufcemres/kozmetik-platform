/**
 * Fuzzy match scraped Trendyol images to DB products and update.
 * Reads scraped-images.json, matches by brand + name similarity, updates product_images.
 *
 * Run from apps/api: node src/database/seeds/match-images.js
 */
const { Client } = require('pg');
const path = require('path');

const DB = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

// ─── Normalize text for comparison ───
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ı/g, 'i')
    .replace(/[^a-z0-9%+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Extract key terms (ingredient names, percentages) ───
function extractKeyTerms(text) {
  const norm = normalize(text);
  const terms = new Set();

  // Percentages (e.g., "10%", "2%")
  const pcts = norm.match(/\d+%/g) || [];
  pcts.forEach(p => terms.add(p));

  // Key ingredient words
  const ingredients = [
    'niacinamide', 'zinc', 'glycolic', 'hyaluronic', 'salicylic', 'retinol', 'retinoid',
    'vitamin c', 'squalane', 'caffeine', 'arbutin', 'aha', 'bha', 'peeling', 'peptide',
    'azelaic', 'lactic', 'matrixyl', 'argireline', 'sulfur', 'centella', 'cica',
    'snail', 'mucin', 'propolis', 'rice', 'birch', 'dokdo', 'mugwort', 'pine',
    'effaclar', 'toleriane', 'lipikar', 'cicaplast', 'anthelios', 'photoderm',
    'sebium', 'atoderm', 'sensibio', 'pigmentbio', 'mela b3', 'hyalu b5',
    'moisture surge', 'dramatically different', 'clarifying', 'take the day off',
    'ultra facial', 'midnight recovery', 'rare earth', 'calendula', 'powerful strength',
    'foaming', 'hydrating', 'moisturizing', 'cleanser', 'toner', 'serum', 'cream',
    'lotion', 'masque', 'mask', 'gel', 'balm', 'oil', 'spf', 'sunscreen',
  ];

  for (const ing of ingredients) {
    if (norm.includes(ing)) terms.add(ing);
  }

  // Size numbers (30ml, 50ml, etc.)
  const sizes = norm.match(/\d+\s*(ml|gr?|oz)/g) || [];
  sizes.forEach(s => terms.add(s.replace(/\s/g, '')));

  return terms;
}

// ─── Similarity score between two products ───
function similarity(scraped, dbProduct) {
  const scrapedTerms = extractKeyTerms(scraped);
  const dbTerms = extractKeyTerms(dbProduct);

  if (scrapedTerms.size === 0 || dbTerms.size === 0) return 0;

  let matches = 0;
  for (const term of scrapedTerms) {
    if (dbTerms.has(term)) matches++;
  }

  // Jaccard-like coefficient weighted by match count
  const union = new Set([...scrapedTerms, ...dbTerms]).size;
  const jaccard = matches / union;

  // Also check simple word overlap
  const scrapedWords = new Set(normalize(scraped).split(' ').filter(w => w.length > 2));
  const dbWords = new Set(normalize(dbProduct).split(' ').filter(w => w.length > 2));
  let wordMatches = 0;
  for (const w of scrapedWords) {
    if (dbWords.has(w)) wordMatches++;
  }
  const wordScore = scrapedWords.size > 0 ? wordMatches / Math.max(scrapedWords.size, dbWords.size) : 0;

  // Combined score: ingredient terms matter more
  return jaccard * 0.6 + wordScore * 0.4;
}

async function main() {
  // Load scraped data
  const scrapedData = require(path.join(__dirname, 'scraped-images.json'));
  console.log(`Loaded ${scrapedData.length} scraped images\n`);

  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Get all products with DiceBear images + brand
  const { rows: products } = await client.query(`
    SELECT p.product_id, p.product_name, p.product_slug, b.brand_name,
           pi.image_id, pi.image_url
    FROM products p
    JOIN brands b ON b.brand_id = p.brand_id
    JOIN product_images pi ON pi.product_id = p.product_id
    WHERE (pi.image_url LIKE '%dicebear%' OR pi.image_url LIKE '%placehold.co%')
    AND pi.image_id = (
      SELECT MIN(pi2.image_id) FROM product_images pi2
      WHERE pi2.product_id = p.product_id AND (pi2.image_url LIKE '%dicebear%' OR pi2.image_url LIKE '%placehold.co%')
    )
    ORDER BY b.brand_name, p.product_id
  `);

  console.log(`Found ${products.length} products with DiceBear images\n`);

  // Group scraped data by brand (normalized)
  const scrapedByBrand = {};
  for (const item of scrapedData) {
    const key = normalize(item.brand);
    if (!scrapedByBrand[key]) scrapedByBrand[key] = [];
    scrapedByBrand[key].push(item);
  }

  let updated = 0, noMatch = 0;
  const matches = [];
  const THRESHOLD = 0.15; // Lowered from 0.25 for broader matching

  for (const product of products) {
    const brandKey = normalize(product.brand_name);
    const candidates = scrapedByBrand[brandKey];

    if (!candidates || candidates.length === 0) {
      noMatch++;
      continue;
    }

    // Find best matching scraped image
    let bestScore = 0;
    let bestImage = null;
    let bestName = '';

    for (const candidate of candidates) {
      const score = similarity(candidate.name, product.product_name);
      if (score > bestScore) {
        bestScore = score;
        bestImage = candidate.img;
        bestName = candidate.name;
      }
    }

    if (bestScore >= THRESHOLD && bestImage) {
      await client.query(
        'UPDATE product_images SET image_url = $1 WHERE image_id = $2',
        [bestImage, product.image_id]
      );
      updated++;
      matches.push({
        db: product.product_name.slice(0, 50),
        scraped: bestName.slice(0, 50),
        score: bestScore.toFixed(2),
      });
    } else {
      noMatch++;
    }
  }

  console.log(`\n═══ RESULTS ═══`);
  console.log(`Updated: ${updated}`);
  console.log(`No match: ${noMatch}`);
  console.log(`\nTop matches:`);
  matches.sort((a, b) => b.score - a.score);
  matches.slice(0, 20).forEach(m => {
    console.log(`  [${m.score}] "${m.db}" → "${m.scraped}"`);
  });

  if (matches.length > 20) {
    console.log(`\nLowest accepted matches:`);
    matches.slice(-5).forEach(m => {
      console.log(`  [${m.score}] "${m.db}" → "${m.scraped}"`);
    });
  }

  // Verify final stats
  const verify = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE image_url LIKE '%dicebear%' OR image_url LIKE '%placehold.co%') as placeholder,
      COUNT(*) FILTER (WHERE image_url LIKE '%dsmcdn%') as trendyol_cdn,
      COUNT(*) FILTER (WHERE image_url NOT LIKE '%dicebear%' AND image_url NOT LIKE '%placehold.co%') as real_total,
      COUNT(*) as total
    FROM product_images
  `);
  console.log('\nFinal image stats:', verify.rows[0]);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
