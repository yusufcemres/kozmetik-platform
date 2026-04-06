import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ürün Karşılaştır — REVELA',
  description: 'Kozmetik ürünlerini yan yana karşılaştır: içerik analizi, fiyat, puan ve kullanıcı yorumları.',
  openGraph: {
    title: 'Ürün Karşılaştır — REVELA',
    description: 'Kozmetik ürünlerini yan yana karşılaştır.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
