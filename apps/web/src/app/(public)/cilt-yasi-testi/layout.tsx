import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cilt Yaşı Testi — Cildin Gerçek Yaşı Ne?',
  description:
    'Yaşam tarzı, beslenme, güneş maruziyeti ve cilt bakım alışkanlıklarına göre cildinin tahmini biyolojik yaşını öğren. Eğitim amaçlı.',
  alternates: { canonical: '/cilt-yasi-testi' },
  openGraph: { title: 'Cilt Yaşı Testi | REVELA', description: 'Cilt biyolojik yaş tahmini eğlenceli testi.', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
