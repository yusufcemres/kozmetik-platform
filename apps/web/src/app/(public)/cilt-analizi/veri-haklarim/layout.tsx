import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veri Haklarım — REVELA',
  description: 'KVKK Madde 11 kapsamında veri haklarım: indir, sil, düzelt.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
