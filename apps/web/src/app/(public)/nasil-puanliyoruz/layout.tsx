import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nasıl Puanlıyoruz — Skor Formülü',
  description:
    'REVELA ürün skoru nasıl hesaplanır: 7 boyut (kanıt, INCI, güvenlik, bariyer, sürdürülebilirlik, şeffaflık, fiyat) ve ağırlıkları.',
  alternates: { canonical: '/nasil-puanliyoruz' },
  openGraph: { title: 'Nasıl Puanlıyoruz | REVELA', description: '7 boyutlu şeffaf skor formülü.', type: 'article' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
