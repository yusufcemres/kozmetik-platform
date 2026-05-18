import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Foto Cilt Analizi — REVELA',
  description: 'Yüz fotoğrafından AI destekli 6 boyutlu cilt analizi: nem, yağ, kolajen, pigment, hassasiyet ve doku. Saniyeler içinde kişiselleştirilmiş ürün önerisi.',
  openGraph: {
    title: 'Foto Cilt Analizi — REVELA',
    description: 'Selfie ile saniyeler içinde bilimsel cilt analizi.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
