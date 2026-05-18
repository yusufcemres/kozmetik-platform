import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cilt Analizi Sonucum — REVELA',
  description: 'Kişiselleştirilmiş cilt analizi sonucum, ürün önerilerim ve rutinim.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
