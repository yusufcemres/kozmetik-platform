import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kozmetik Ürünleri — REVELA',
  description: '1900+ kozmetik ürünü, INCI analizi ve fiyat karşılaştırma. Cilt tipine göre en uygun ürünü bul.',
  openGraph: {
    title: 'Kozmetik Ürünleri — REVELA',
    description: '1900+ kozmetik ürünü, INCI analizi ve fiyat karşılaştırma.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
