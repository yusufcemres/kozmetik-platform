import type { MetadataRoute } from 'next';

const BASE_URL = 'https://kozmetikplatform.com';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function fetchSlugs(endpoint: string, slugField: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}?limit=500&page=1`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((item: Record<string, string>) => item[slugField]).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/urunler`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/icerikler`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/ihtiyaclar`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/takviyeler`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/rehber`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/ara`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/profilim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Dynamic pages from API
  const [productSlugs, ingredientSlugs, needSlugs] = await Promise.all([
    fetchSlugs('/products', 'product_slug'),
    fetchSlugs('/ingredients', 'ingredient_slug'),
    fetchSlugs('/needs', 'need_slug'),
  ]);

  const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE_URL}/urunler/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const ingredientPages: MetadataRoute.Sitemap = ingredientSlugs.map((slug) => ({
    url: `${BASE_URL}/icerikler/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const needPages: MetadataRoute.Sitemap = needSlugs.map((slug) => ({
    url: `${BASE_URL}/ihtiyaclar/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...ingredientPages, ...needPages];
}
