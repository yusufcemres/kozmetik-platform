/**
 * Faz O — affiliate link'lere partner ID ekler.
 *
 * Trendyol Partner, Hepsiburada Affiliate, Amazon TR Associates otomatik onayı
 * alındıktan sonra .env'e ID'ler girilip bu script çalıştırılır.
 *
 * ENV:
 *   AFFILIATE_TY_PARTNER_ID=...
 *   AFFILIATE_HB_PARTNER_ID=...
 *   AFFILIATE_AMAZON_TAG=...
 */
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

function rewrite(url, platform) {
  try {
    const u = new URL(url);
    if (platform === 'trendyol' && process.env.AFFILIATE_TY_PARTNER_ID) {
      u.searchParams.set('utm_source', 'revela');
      u.searchParams.set('utm_medium', 'affiliate');
      u.searchParams.set('partner', process.env.AFFILIATE_TY_PARTNER_ID);
    } else if (platform === 'hepsiburada' && process.env.AFFILIATE_HB_PARTNER_ID) {
      u.searchParams.set('utm_source', 'revela');
      u.searchParams.set('utm_medium', 'affiliate');
      u.searchParams.set('wt_mc', process.env.AFFILIATE_HB_PARTNER_ID);
    } else if (platform === 'amazon' && process.env.AFFILIATE_AMAZON_TAG) {
      u.searchParams.set('tag', process.env.AFFILIATE_AMAZON_TAG);
    }
    return u.toString();
  } catch {
    return url;
  }
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query(
    `SELECT affiliate_link_id, platform, url FROM affiliate_links WHERE status = 'valid' OR status IS NULL`,
  );
  let updated = 0;
  for (const r of rows) {
    const newUrl = rewrite(r.url, r.platform);
    if (newUrl !== r.url) {
      await client.query(
        `UPDATE affiliate_links SET url = $1 WHERE affiliate_link_id = $2`,
        [newUrl, r.affiliate_link_id],
      );
      updated++;
    }
  }
  console.log(`✓ ${updated}/${rows.length} affiliate links rewritten with partner IDs`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
