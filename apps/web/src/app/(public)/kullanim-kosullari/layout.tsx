import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
  description:
    'REVELA platformu kullanım koşulları: hizmet kapsamı, kullanıcı yükümlülükleri, fikri mülkiyet ve sorumluluk sınırlamaları.',
  alternates: { canonical: '/kullanim-kosullari' },
  openGraph: { title: 'Kullanım Koşulları | REVELA', description: 'REVELA platform kullanım koşulları ve hizmet şartları.', type: 'article' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
