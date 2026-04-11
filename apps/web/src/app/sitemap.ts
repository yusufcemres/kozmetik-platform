import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kozmetik-platform.vercel.app';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function fetchSlugs(endpoint: string, slugField: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}?limit=5000&page=1`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || data || []).map((item: Record<string, string>) => item[slugField]).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/urunler`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/onerilerimiz`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/ihtiyaclar`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/markalar`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/cilt-analizi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/takviyeler`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/profilim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/karsilastir`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/ara`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/hakkimizda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/metodoloji`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/iletisim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/gizlilik`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/kullanim-kosullari`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [productSlugs, ingredientSlugs, needSlugs, brandSlugs, supplementSlugs] = await Promise.all([
    fetchSlugs('/products', 'product_slug'),
    fetchSlugs('/ingredients', 'ingredient_slug'),
    fetchSlugs('/needs', 'need_slug'),
    fetchSlugs('/brands', 'brand_slug'),
    fetchSlugs('/supplements', 'product_slug'),
  ]);

  const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE_URL}/urunler/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const ingredientPages: MetadataRoute.Sitemap = ingredientSlugs.map((slug) => ({
    url: `${BASE_URL}/icerikler/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const needPages: MetadataRoute.Sitemap = needSlugs.map((slug) => ({
    url: `${BASE_URL}/ihtiyaclar/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const brandPages: MetadataRoute.Sitemap = brandSlugs.map((slug) => ({
    url: `${BASE_URL}/markalar/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const supplementPages: MetadataRoute.Sitemap = supplementSlugs.map((slug) => ({
    url: `${BASE_URL}/takviyeler/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...supplementPages, ...ingredientPages, ...needPages, ...brandPages];
}
