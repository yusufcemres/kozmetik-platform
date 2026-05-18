import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Üyelik — REVELA',
  description: 'REVELA Premium ile sınırsız cilt analizi, karşılaştırma, trend takibi ve AI Cilt Danışmanı. 29 TL\'den başlayan planlar, 14 gün koşulsuz iade.',
  openGraph: {
    title: 'REVELA Premium — Cilt Analizi + AI Danışman',
    description: 'Sınırsız analiz, karşılaştırma, trend, AI sohbet. 29 TL\'den.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
