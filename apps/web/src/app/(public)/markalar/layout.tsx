import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markalar — REVELA',
  description: '113 kozmetik markası, ürün sayıları ve detaylı bilgi. En popüler markalar ve ürün analizleri.',
  alternates: { canonical: 'https://revela.com.tr/markalar' },
  openGraph: {
    url: 'https://revela.com.tr/markalar',
    title: 'Markalar — REVELA',
    description: '113 kozmetik markası, ürün sayıları ve detaylı bilgi.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
