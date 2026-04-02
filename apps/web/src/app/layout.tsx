import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Kozmetik Platform — Ürünlerini Anla, Cildine Uygun Olanı Bul',
    template: '%s | Kozmetik Platform',
  },
  description:
    'Kozmetik ürünlerin INCI içeriklerini analiz et, cildine uygun ürünleri bilimsel kanıtlarla keşfet. Türkçe kozmetik içerik ansiklopedisi.',
  keywords: [
    'kozmetik', 'inci analiz', 'cilt bakım', 'ingredient', 'içerik maddesi',
    'niacinamide', 'retinol', 'hyaluronic acid', 'serum', 'nemlendirici',
    'sivilce', 'akne', 'leke', 'kırışıklık', 'cilt tipi',
  ],
  authors: [{ name: 'Kozmetik Platform' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kozmetik Platform',
    title: 'Kozmetik Platform — Ürünlerini Anla',
    description: 'Kozmetik ürünlerin INCI içeriklerini analiz et, cildine uygun ürünleri keşfet.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kozmetik Platform',
    description: 'Kozmetik ürünlerin INCI içeriklerini analiz et, cildine uygun ürünleri keşfet.',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#2f9468',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
