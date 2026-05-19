import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Etki Tablosu — REVELA',
  description: 'Aktif INCI × profesyonel yöntem sinerji rehberi. 10 kanıt-temelli kombinasyon.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
