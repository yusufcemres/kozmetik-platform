import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beslenme Analizi — Takviye İhtiyacı Testi',
  description:
    'Beslenme alışkanlıklarını, eksiklik belirtilerini ve hedeflerini değerlendir; REVELA bilim destekli takviye seçim önerisi versin.',
  alternates: { canonical: '/beslenme-analizi' },
  openGraph: { title: 'Beslenme Analizi | REVELA', description: 'Takviye seçimi için kişisel beslenme testi.', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
