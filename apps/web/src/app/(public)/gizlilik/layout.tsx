import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description:
    'REVELA gizlilik politikası: kişisel verilerinizin nasıl işlendiği, KVKK Madde 5/11 hakları, çerez yönetimi ve veri silme talebi.',
  alternates: { canonical: '/gizlilik' },
  openGraph: { title: 'Gizlilik Politikası | REVELA', description: 'KVKK uyumlu gizlilik politikası ve kullanıcı hakları.', type: 'article' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
