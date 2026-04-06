import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Takviye Ürünler — REVELA',
  description: 'Cilt sağlığını destekleyen takviye ürünleri. Vitamin, mineral ve bitkisel destek ürünleri.',
  openGraph: {
    title: 'Takviye Ürünler — REVELA',
    description: 'Cilt sağlığını destekleyen takviye ürünleri.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
