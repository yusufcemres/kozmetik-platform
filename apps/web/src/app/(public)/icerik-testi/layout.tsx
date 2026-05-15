import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İçerik Bilgi Testi — INCI Ne Kadar Biliyorsun?',
  description:
    'Niasinamid, retinol, hyaluronik asit, BHA, peptit ve daha fazlası — kozmetik içerik bilgini test et, doğru cevapları bilim açıklamalarıyla öğren.',
  alternates: { canonical: '/icerik-testi' },
  openGraph: { title: 'İçerik Bilgi Testi | REVELA', description: 'INCI bilgi testi + bilim açıklamalı sonuç.', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
