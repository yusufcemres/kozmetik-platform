import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markalar — REVELA',
  description: '113 kozmetik markası, ürün sayıları ve detaylı bilgi. En popüler markalar ve ürün analizleri.',
  openGraph: {
    title: 'Markalar — REVELA',
    description: '113 kozmetik markası, ürün sayıları ve detaylı bilgi.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
