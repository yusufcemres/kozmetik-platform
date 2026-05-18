import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ödeme Sonucu — REVELA',
  description: 'Ödeme işlem sonucu.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
