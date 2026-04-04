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
  themeColor: '#5f5e5e',
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
      <body className="antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
