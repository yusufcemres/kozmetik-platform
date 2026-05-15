import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'REVELA ile iletişime geç: marka ortaklıkları, kullanıcı destek, içerik geri bildirimi ve basın talepleri.',
  alternates: { canonical: '/iletisim' },
  openGraph: { title: 'İletişim | REVELA', description: 'Marka ortaklık, destek ve geri bildirim kanalları.', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
