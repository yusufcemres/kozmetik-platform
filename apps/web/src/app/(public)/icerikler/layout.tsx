import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İçerik Sözlüğü — REVELA',
  description: '5000+ INCI maddesi, güvenlik sınıfı ve detaylı analizi. Kozmetik içeriklerini öğren.',
  alternates: { canonical: 'https://revela.com.tr/icerikler' },
  openGraph: {
    title: 'İçerik Sözlüğü — REVELA',
    description: '5000+ INCI maddesi, güvenlik sınıfı ve detaylı analizi.',
    url: 'https://revela.com.tr/icerikler',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
