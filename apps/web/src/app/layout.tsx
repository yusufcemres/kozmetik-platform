import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import ThemeProvider from '@/components/providers/ThemeProvider';

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
  appleWebApp: {
    capable: true,
    title: 'REVELA',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1a1a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Prevent dark mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('revela_theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        {/* Sync skin_profile in localStorage → has_skin_profile cookie, so SSR knows to hide "Cilt profili oluştur" CTAs */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('skin_profile');document.cookie='has_skin_profile='+(p?'1':'')+';path=/;max-age='+(p?31536000:0)+';SameSite=Lax'}catch(e){}})()`,
          }}
        />
        {/* Google Analytics 4 with Consent Mode v2 */}
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  window.gtag = gtag;
                  // Consent Mode v2 — default denied (KVKK)
                  gtag('consent', 'default', {
                    ad_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied',
                    analytics_storage: 'denied',
                    functionality_storage: 'granted',
                    security_storage: 'granted',
                    wait_for_update: 500
                  });
                  // Apply stored consent if present
                  try {
                    var c = localStorage.getItem('revela_consent');
                    if (c === 'granted') {
                      gtag('consent', 'update', {
                        ad_storage: 'granted',
                        ad_user_data: 'granted',
                        ad_personalization: 'granted',
                        analytics_storage: 'granted'
                      });
                    }
                  } catch(e){}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}', {
                    page_path: window.location.pathname,
                    send_page_view: true,
                    anonymize_ip: true
                  });
                `,
              }}
            />
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`}
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'REVELA',
              url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://kozmetik-platform.vercel.app').replace(/\/+$/, ''),
              description: 'Kozmetik ürünlerin INCI içeriklerini analiz et, cildine uygun ürünleri bilimsel kanıtlarla keşfet.',
              sameAs: [],
            }),
          }}
        />
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
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
