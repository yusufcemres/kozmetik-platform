import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'REVELA — Kozmetik & Takviye İçerik Analizi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: '0.3em', color: '#888' }}>
          REVELA
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Cildine ve vücuduna{'\n'}gerçekten ne giriyor?
          </div>
          <div style={{ fontSize: 32, color: '#a0a0a0', lineHeight: 1.3 }}>
            Bilim temelli içerik analizi · Akıllı tarama · Kişisel öneriler
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#666' }}>
          <div style={{ display: 'flex' }}>revela.com.tr</div>
          <div style={{ display: 'flex' }}>Kozmetik · Takviye · Cilt Analizi</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
