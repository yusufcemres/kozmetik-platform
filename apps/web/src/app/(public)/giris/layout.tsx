import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giriş Yap',
  description: 'REVELA hesabına e-posta ile giriş yap; favorilerin, cilt profilin ve tarama geçmişin senkronlu kalsın.',
  alternates: { canonical: '/giris' },
  robots: { index: false, follow: false },
  openGraph: { title: 'Giriş Yap | REVELA', description: 'Magic link ile şifresiz e-posta girişi.', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
