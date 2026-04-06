/**
 * Cloudflare Worker — og:image Scraper
 *
 * Ürün sayfalarından og:image meta tag'ini çeker.
 * Bot korumasını Cloudflare ağı üzerinden bypass eder.
 *
 * Endpoint: GET /scrape?url=https://www.trendyol.com/...
 * Response: { url, og_image, title, status }
 *
 * Deploy: npx wrangler deploy
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname !== '/scrape') {
      return new Response(JSON.stringify({ error: 'Use /scrape?url=...' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'url parametresi gerekli' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Sadece izin verilen domain'ler
    const allowed = ['trendyol.com', 'hepsiburada.com', 'amazon.com.tr', 'gratis.com', 'watsons.com.tr', 'rossmann.com.tr', 'dermoeczanem.com'];
    const targetHost = new URL(targetUrl).hostname.replace('www.', '');
    if (!allowed.some(d => targetHost.endsWith(d))) {
      return new Response(JSON.stringify({ error: 'Domain izin verilmedi' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'tr-TR,tr;q=0.9',
        },
        redirect: 'follow',
      });

      if (!res.ok) {
        return new Response(JSON.stringify({ url: targetUrl, status: res.status, og_image: null }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const html = await res.text();

      // og:image extract
      const ogImageMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)
        || html.match(/content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
      const ogImage = ogImageMatch?.[1] || null;

      // title extract
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch?.[1]?.trim() || null;

      return new Response(JSON.stringify({
        url: targetUrl,
        status: res.status,
        og_image: ogImage,
        title,
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } catch (err) {
      return new Response(JSON.stringify({
        url: targetUrl,
        error: err.message,
        og_image: null,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
