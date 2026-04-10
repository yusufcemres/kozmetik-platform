/**
 * Tier 1 Affiliate Link Fix — Tavily Search ile Gerçek URL Bulma
 *
 * Trendyol, Hepsiburada, Amazon TR platformları için
 * Tavily Search API ile gerçek ürün URL'leri bulur.
 *
 * Kullanım: TAVILY_API_KEY=tvly-dev-xxx node fix-affiliate-links-tier1.js [platform] [limit]
 *   platform: trendyol | hepsiburada | amazon_tr (varsayılan: trendyol)
 *   limit: max kaç ürün aranacak (varsayılan: 100, free tier = 1000 req/ay)
 *
 * Örnek: TAVILY_API_KEY=tvly-dev-4Hr2B7... node fix-affiliate-links-tier1.js trendyol 200
 */

const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const PLATFORM_CONFIG = {
  trendyol: {
    domain: 'trendyol.com',
    urlPattern: /-p-\d+/,
    label: 'Trendyol',
  },
  hepsiburada: {
    domain: 'hepsiburada.com',
    urlPattern: /-pm-[A-Z0-9]+/i,
    label: 'Hepsiburada',
  },
  amazon_tr: {
    domain: 'amazon.com.tr',
    urlPattern: /\/dp\/[A-Z0-9]{10}/i,
    label: 'Amazon TR',
  },
};

async function searchTavily(query, domain) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('TAVILY_API_KEY env gerekli');

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 3,
      include_domains: [domain],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tavily API hatası: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.results || [];
}

async function main() {
  const platform = process.argv[2] || 'trendyol';
  const limit = parseInt(process.argv[3]) || 100;
  const config = PLATFORM_CONFIG[platform];

  if (!config) {
    console.error(`Geçersiz platform: ${platform}. Seçenekler: ${Object.keys(PLATFORM_CONFIG).join(', ')}`);
    process.exit(1);
  }

  if (!process.env.TAVILY_API_KEY) {
    console.error('TAVILY_API_KEY env gerekli. Kullanım: TAVILY_API_KEY=tvly-xxx node fix-affiliate-links-tier1.js');
    process.exit(1);
  }

  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log(`DB bağlantısı kuruldu. Platform: ${config.label}, Limit: ${limit}`);

  // Henüz düzeltilmemiş linkleri çek (verification_status = unverified)
  const { rows } = await client.query(`
    SELECT al.affiliate_link_id, al.platform, p.product_name, b.brand_name
    FROM affiliate_links al
    JOIN products p ON p.product_id = al.product_id
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    WHERE al.platform = $1
      AND (al.verification_status = 'unverified' OR al.verification_status IS NULL)
    ORDER BY p.product_id
    LIMIT $2
  `, [platform, limit]);

  console.log(`${rows.length} link bulundu (unverified ${config.label})`);

  let found = 0, notFound = 0, errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const searchQuery = `site:${config.domain} ${row.brand_name || ''} ${row.product_name}`.trim();

    try {
      const results = await searchTavily(searchQuery, config.domain);
      const match = results.find(r => config.urlPattern.test(r.url));

      if (match) {
        await client.query(`
          UPDATE affiliate_links
          SET affiliate_url = $1,
              verification_status = 'valid',
              last_verified = NOW(),
              is_active = true
          WHERE affiliate_link_id = $2
        `, [match.url, row.affiliate_link_id]);
        found++;
      } else {
        // URL bulunamadı — search URL'ye çevir
        const searchUrl = `https://www.${config.domain}/sr?q=${encodeURIComponent(row.product_name)}`;
        await client.query(`
          UPDATE affiliate_links
          SET affiliate_url = $1,
              verification_status = 'search_only',
              last_verified = NOW(),
              is_active = true
          WHERE affiliate_link_id = $2
        `, [searchUrl, row.affiliate_link_id]);
        notFound++;
      }

      if ((i + 1) % 10 === 0) {
        console.log(`  ${i + 1}/${rows.length} — bulundu: ${found}, search: ${notFound}, hata: ${errors}`);
      }

      // Rate limit: 100ms bekle
      await new Promise(r => setTimeout(r, 100));

    } catch (err) {
      console.error(`  Hata (${row.product_name}): ${err.message}`);
      errors++;
      // Rate limit hatası ise dur
      if (err.message.includes('429') || err.message.includes('rate')) {
        console.log('Rate limit — 5s bekleniyor...');
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }

  console.log('\n=== SONUÇ ===');
  console.log(`Platform: ${config.label}`);
  console.log(`Toplam: ${rows.length}`);
  console.log(`Gerçek URL bulundu: ${found}`);
  console.log(`Search URL'ye çevrildi: ${notFound}`);
  console.log(`Hata: ${errors}`);

  await client.end();
  console.log('Bitti.');
}

main().catch(console.error);
