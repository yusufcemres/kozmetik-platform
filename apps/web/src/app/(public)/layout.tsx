import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import BottomNav from '@/components/public/BottomNav';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-[65px] pb-20 md:pb-0 bg-surface">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}
