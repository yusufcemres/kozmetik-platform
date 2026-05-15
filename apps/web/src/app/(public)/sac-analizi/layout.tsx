import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saç Analizi — Saç Tipi ve İhtiyaç Testi',
  description:
    'Saç tipini (kuru, yağlı, karma, hassas), incelmesini, dökülmesini ve hedef ihtiyaçlarını test et; REVELA bilim destekli kişisel saç bakım önerisi versin.',
  alternates: { canonical: '/sac-analizi' },
  openGraph: { title: 'Saç Analizi | REVELA', description: 'Saç tipine ve ihtiyaca özel ücretsiz test.', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
