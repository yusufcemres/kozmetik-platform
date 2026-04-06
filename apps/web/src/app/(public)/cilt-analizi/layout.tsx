import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cilt Analizi — REVELA',
  description: 'AI destekli 7 adımlı cilt analizi. Cilt tipini belirle, kişiselleştirilmiş ürün önerisi al.',
  openGraph: {
    title: 'Cilt Analizi — REVELA',
    description: 'AI destekli cilt analizi ve kişiselleştirilmiş ürün önerisi.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
