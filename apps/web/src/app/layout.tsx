import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: {
    default: 'REVELA — Kozmetik İçerik Analizi, Cildine Uygun Ürünü Bul',
    template: '%s | REVELA',
  },
  description:
    'Kozmetik ürünlerin INCI içeriklerini analiz et, cildine uygun ürünleri bilimsel kanıtlarla keşfet. Türkçe kozmetik içerik ansiklopedisi.',
  keywords: [
    'kozmetik', 'inci analiz', 'cilt bakım', 'ingredient', 'içerik maddesi',
    'niacinamide', 'retinol', 'hyaluronic acid', 'serum', 'nemlendirici',
    'sivilce', 'akne', 'leke', 'kırışıklık', 'cilt tipi', 'revela',
  ],
  authors: [{ name: 'REVELA' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'REVELA',
    title: 'REVELA — Kozmetik İçerik Analizi',
    description: 'Kozmetik ürünlerin INCI içeriklerini analiz et, cildine uygun ürünleri keşfet.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'REVELA',
    description: 'Kozmetik ürünlerin INCI içeriklerini analiz et, cildine uygun ürünleri keşfet.',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#1a1a1a',
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&subset=latin,latin-ext&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&subset=latin,latin-ext&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
