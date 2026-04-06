import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Önerileri — REVELA',
  description: 'Cilt tipine ve ihtiyacına özel AI kozmetik önerileri. Bilimsel verilere dayalı kişisel ürün tavsiyeleri.',
  openGraph: {
    title: 'AI Önerileri — REVELA',
    description: 'Cilt tipine özel AI kozmetik önerileri.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
