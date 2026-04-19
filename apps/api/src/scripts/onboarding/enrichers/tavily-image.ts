/**
 * Tavily Extract fallback for product image. Shares the URL-filter logic used
 * by seeds/scrape-missing-tavily.js but runs on a single URL and returns the
 * best-guess CDN image.
 *
 * Used by Stage 2 when the JSON payload omits image_url. Never blocks — on
 * failure we record a warning and let Stage 3 insert a placeholder URL.
 */

const TAVILY_KEY = process.env.TAVILY_API_KEY;

export async function fetchProductImageViaTavily(url: string): Promise<{ url: string | null; warning?: string }> {
  if (!TAVILY_KEY) {
    return { url: null, warning: 'TAVILY_API_KEY .env içinde yok, image fetch atlandı.' };
  }
  try {
    const res = await fetch('https://api.tavily.com/extract', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TAVILY_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls: [url], include_images: true, extract_depth: 'basic' }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { url: null, warning: `Tavily ${res.status}: ${text.slice(0, 120)}` };
    }
    const data: any = await res.json();
    const first = (data?.results ?? [])[0] ?? {};
    const images: unknown[] = first.images ?? [];
    const rawContent: string | undefined = first.raw_content;

    const imageStrings = images.filter((i): i is string => typeof i === 'string' && i.startsWith('http'));
    const good = imageStrings.find(
      (u) => !/logo|favicon|placeholder|icon/i.test(u) && /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u),
    );
    if (good) return { url: good };

    const firstHttp = imageStrings.find((u) => !/logo|favicon/i.test(u));
    if (firstHttp) return { url: firstHttp };

    if (typeof rawContent === 'string') {
      const m = rawContent.match(
        /https?:\/\/(?:cdn\.dsmcdn\.com|productimages\.hepsiburada\.net)\/[^\s"')]+\.(?:jpg|jpeg|png|webp)/i,
      );
      if (m) return { url: m[0] };
    }
    return { url: null, warning: 'Tavily yanıtında uygun image bulunamadı.' };
  } catch (e: any) {
    return { url: null, warning: `Tavily fetch exception: ${e?.message ?? e}` };
  }
}
