import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favorilerim — REVELA',
  description: 'Favori kozmetik ürünleriniz. Fiyat takibi ve karşılaştırma için ürünleri kaydedin.',
  openGraph: {
    title: 'Favorilerim — REVELA',
    description: 'Favori kozmetik ürünleriniz.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
