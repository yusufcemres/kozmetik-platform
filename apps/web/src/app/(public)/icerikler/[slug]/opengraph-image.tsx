import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'REVELA içerik analizi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getIngredient(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/ingredients/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const SAFETY_COLORS: Record<string, { bg: string; label: string }> = {
  safe: { bg: '#10b981', label: 'GÜVENLİ' },
  caution: { bg: '#f59e0b', label: 'DİKKATLİ KULLAN' },
  avoid: { bg: '#ef4444', label: 'KAÇIN' },
};

export default async function Image({ params }: { params: { slug: string } }) {
  const ing = await getIngredient(params.slug);
  const name = ing?.inci_name || 'İçerik';
  const common = ing?.common_name || '';
  const safety = ing?.safety_class ? SAFETY_COLORS[ing.safety_class] : null;
  const summary = ing?.function_summary || '';

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
            REVELA · İÇERİK
          </div>
          {safety && (
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 700,
                color: '#ffffff',
                background: safety.bg,
                padding: '12px 24px',
                borderRadius: 4,
                letterSpacing: '0.15em',
              }}
            >
              {safety.label}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              maxWidth: 1000,
            }}
          >
            {name}
          </div>
          {common && (
            <div style={{ display: 'flex', fontSize: 32, color: '#a0a0a0' }}>
              {common}
            </div>
          )}
          {summary && (
            <div
              style={{
                fontSize: 26,
                color: '#888',
                lineHeight: 1.4,
                maxWidth: 1000,
                marginTop: 8,
              }}
            >
              {summary.length > 120 ? summary.slice(0, 120) + '…' : summary}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#666' }}>
          <div style={{ display: 'flex' }}>revela.com.tr/icerikler</div>
          <div style={{ display: 'flex' }}>INCI · Bilimsel kanıt</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
