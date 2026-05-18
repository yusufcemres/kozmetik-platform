import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analiz Karşılaştır — REVELA',
  description: 'İki cilt analiz sonucunu yan yana gör. Nem, yağ, kolajen, pigment, hassasiyet ve doku boyutlarında delta — neyin iyileştiğini ölç.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
