import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ürün Tara — Barkod ve Foto ile Anında Analiz',
  description:
    'Kozmetik veya takviye ürününün barkodunu okut veya etiket fotoğrafını çek; REVELA bileşenleri tanıyıp güvenlik + uyumluluk skoru gösterir.',
  alternates: { canonical: '/tara' },
  openGraph: { title: 'Ürün Tara | REVELA', description: 'Barkod + foto smart-scan ile anında bilim destekli analiz.', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
