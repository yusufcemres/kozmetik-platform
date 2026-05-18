import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cilt Trendim — REVELA',
  description: 'Cilt analizlerimin zaman içindeki değişimi. Sparkline grafiklerle 6 boyutta ilerlemeyi gör.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
