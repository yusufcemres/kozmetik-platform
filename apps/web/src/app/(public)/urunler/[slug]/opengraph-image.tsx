import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'REVELA ürün analizi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  const name = product?.product_name || 'Ürün';
  const brand = product?.brand?.brand_name || '';
  const score = product?.avg_score ?? product?.average_rating ?? null;
  const category = product?.category?.category_name || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#0a0a0a',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 28, letterSpacing: '0.3em', color: '#888' }}>
            REVELA
          </div>
          {category && (
            <div
              style={{
                display: 'flex',
                fontSize: 20,
                letterSpacing: '0.2em',
                color: '#a0a0a0',
                border: '1px solid #333',
                padding: '8px 16px',
                borderRadius: 4,
              }}
            >
              {category.toUpperCase()}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {brand && (
            <div style={{ display: 'flex', fontSize: 32, color: '#a0a0a0', letterSpacing: '0.1em' }}>
              {brand.toUpperCase()}
            </div>
          )}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: 1000,
            }}
          >
            {name}
          </div>
          {score !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
              <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, color: '#10b981' }}>
                {Number(score).toFixed(1)}
              </div>
              <div style={{ display: 'flex', fontSize: 24, color: '#888' }}>/ 10 REVELA SKORU</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#666' }}>
          <div style={{ display: 'flex' }}>revela.com.tr</div>
          <div style={{ display: 'flex' }}>Bilim temelli içerik analizi</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
