import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description:
    'REVELA KVKK aydınlatma metni: 6698 sayılı Kanun kapsamında veri sorumlusu, işlenen veri türleri, hukuki sebepler ve kullanıcı hakları.',
  alternates: { canonical: '/kvkk' },
  openGraph: { title: 'KVKK Aydınlatma Metni | REVELA', description: 'KVKK 6698 sayılı Kanun uyumlu aydınlatma metni.', type: 'article' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
