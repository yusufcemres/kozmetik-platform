import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Kozmetik Platform',
    template: '%s | Kozmetik Platform',
  },
  description:
    'Kozmetik ürünlerin içeriklerini anla, ihtiyacına uygun ürünleri keşfet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
