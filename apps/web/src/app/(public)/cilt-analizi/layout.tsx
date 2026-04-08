import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cilt Analizi — REVELA',
  description: 'Derinlemesine 10 adımlı cilt analizi. Cilt tipini, ihtiyaçlarını, hassasiyetlerini belirle, bilimsel kanıtlarla kişiselleştirilmiş ürün önerisi al.',
  openGraph: {
    title: 'Cilt Analizi — REVELA',
    description: 'AI destekli cilt analizi ve kişiselleştirilmiş ürün önerisi.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
