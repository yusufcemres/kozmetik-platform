import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markalar — REVELA',
  description: '113 kozmetik markasi, urun sayilari ve detayli bilgi. En populer markalar ve urun analizleri.',
  openGraph: {
    title: 'Markalar — REVELA',
    description: '113 kozmetik markasi, urun sayilari ve detayli bilgi.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
