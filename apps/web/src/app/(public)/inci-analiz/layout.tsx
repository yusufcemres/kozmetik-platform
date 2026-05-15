import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'INCI Liste Analiz — Ürün İçeriği Yapıştır, Skoru Gör',
  description:
    'Ürünün INCI listesini yapıştır, REVELA otomatik analiz etsin: aktif bileşenler, alerjen flag\'leri, güvenlik notları ve alternatif ürün önerileri.',
  alternates: { canonical: '/inci-analiz' },
  openGraph: { title: 'INCI Analiz | REVELA', description: 'INCI listesi yapıştır → anında bilim destekli skor.', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
