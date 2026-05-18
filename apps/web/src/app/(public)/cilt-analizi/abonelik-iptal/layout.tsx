import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hatırlatma Aboneliği — REVELA',
  description: 'Cilt analizi hatırlatma e-postası abonelik tercihi.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
