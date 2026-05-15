import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description:
    'REVELA: Türkiye\'nin bağımsız kozmetik ve takviye içerik analiz platformu. 1.795+ ürün, 5.139+ INCI, atıflı bilim katmanı.',
  alternates: { canonical: '/hakkimizda' },
  openGraph: { title: 'Hakkımızda | REVELA', description: 'Bilim destekli, bağımsız kozmetik içerik analiz platformu.', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
