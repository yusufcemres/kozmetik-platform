import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cilt Profilim — REVELA',
  description: 'Kişisel cilt profiliniz ve analiz geçmişi. Cilt tipinize özel ürün önerileri.',
  openGraph: {
    title: 'Cilt Profilim — REVELA',
    description: 'Kişisel cilt profiliniz ve analiz geçmişi.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
