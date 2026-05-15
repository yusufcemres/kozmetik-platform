import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez Politikası',
  description:
    'REVELA çerez politikası: zorunlu, analitik ve pazarlama çerezleri, kategorize rıza yönetimi ve tercihlerin değiştirilmesi.',
  alternates: { canonical: '/cerez-politikasi' },
  openGraph: { title: 'Çerez Politikası | REVELA', description: '3 kategori çerez yönetimi ve GDPR/KVKK uyum.', type: 'article' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
