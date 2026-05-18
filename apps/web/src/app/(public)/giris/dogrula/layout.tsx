import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giriş Doğrulanıyor — REVELA',
  description: 'Sihirli bağlantı doğrulanıyor.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
