import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import BottomNav from '@/components/public/BottomNav';
import AnalyticsProvider from '@/components/providers/AnalyticsProvider';
import OnboardingModal from '@/components/public/OnboardingModal';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnalyticsProvider>
      <Header />
      <main className="min-h-screen pt-[65px] pb-20 md:pb-0 bg-surface">{children}</main>
      <Footer />
      <BottomNav />
      <OnboardingModal />
    </AnalyticsProvider>
  );
}
