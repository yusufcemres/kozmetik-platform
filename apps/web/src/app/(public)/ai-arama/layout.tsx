import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Arama — Doğal Dil ile Ürün Bul',
  description:
    'Sorununu yaz, AI cildine uygun ürünleri bulsun: "yağlı cilt için niasinamidli serum", "hassas cilt için sülfatsız temizleyici" gibi doğal cümleler yeterli.',
  alternates: { canonical: '/ai-arama' },
  openGraph: { title: 'AI Arama | REVELA', description: 'Doğal dil ile kozmetik ürün arama.', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
