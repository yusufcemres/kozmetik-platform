import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Takviye Ürünler — REVELA',
  description: 'Cilt sağlığını destekleyen takviye ürünleri. Vitamin, mineral ve bitkisel destek ürünleri.',
  alternates: { canonical: 'https://revela.com.tr/takviyeler' },
  openGraph: {
    url: 'https://revela.com.tr/takviyeler',
    title: 'Takviye Ürünler — REVELA',
    description: 'Cilt sağlığını destekleyen takviye ürünleri.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
