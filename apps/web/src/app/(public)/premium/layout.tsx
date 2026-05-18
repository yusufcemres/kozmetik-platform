import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Panelim — REVELA',
  description: 'Premium üyelik durumum, ödeme geçmişim ve abonelik yönetimi.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
