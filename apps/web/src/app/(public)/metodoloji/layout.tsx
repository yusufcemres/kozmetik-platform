import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Metodoloji — Bilim Kütüphanesi',
  description:
    'REVELA kanıt seviyesi, A-E güvenlik notu, CIR/SCCS/PubMed atıf zinciri ve şeffaf skor formülü. Her INCI iddiası kanıtlı.',
  alternates: { canonical: '/metodoloji' },
  openGraph: { title: 'Metodoloji | REVELA', description: 'Atıflı bilim katmanı, kanıt seviyesi ve şeffaf skor formülü.', type: 'article' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
