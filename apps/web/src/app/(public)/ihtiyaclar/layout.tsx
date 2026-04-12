import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cilt İhtiyaçları — REVELA',
  description: 'Nemlendirme, anti-aging, leke giderme, akne tedavisi... Cilt ihtiyacına göre en uygun ürünleri bul.',
  alternates: { canonical: 'https://revela.com.tr/ihtiyaclar' },
  openGraph: {
    url: 'https://revela.com.tr/ihtiyaclar',
    title: 'Cilt İhtiyaçları — REVELA',
    description: 'Cilt ihtiyacına göre en uygun kozmetik ürünleri bul.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
