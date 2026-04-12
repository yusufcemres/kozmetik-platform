import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ürün Ara — REVELA',
  description: 'Kozmetik ürün ve ingredient arama. 1900+ ürün, 5000 INCI maddesi içinde ara.',
  alternates: { canonical: 'https://revela.com.tr/ara' },
  openGraph: {
    url: 'https://revela.com.tr/ara',
    title: 'Ürün Ara — REVELA',
    description: 'Kozmetik ürün ve ingredient arama.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
