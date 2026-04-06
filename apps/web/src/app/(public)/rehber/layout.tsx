import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cilt Bakım Rehberi — REVELA',
  description: 'Bilimsel cilt bakım rehberleri ve ipuçları. Ingredient bilgisi, rutinler ve uzman tavsiyeleri.',
  openGraph: {
    title: 'Cilt Bakım Rehberi — REVELA',
    description: 'Bilimsel cilt bakım rehberleri ve ipuçları.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
