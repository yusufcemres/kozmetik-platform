import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          Kozmetik Platform
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/urunler" className="text-gray-600 hover:text-primary transition-colors">
            Ürünler
          </Link>
          <Link href="/icerikler" className="text-gray-600 hover:text-primary transition-colors">
            İçerikler
          </Link>
          <Link href="/ihtiyaclar" className="text-gray-600 hover:text-primary transition-colors">
            İhtiyaçlar
          </Link>
          <Link href="/rehber" className="text-gray-600 hover:text-primary transition-colors">
            Rehber
          </Link>
          <Link href="/profilim" className="text-gray-600 hover:text-primary transition-colors">
            Profilim
          </Link>
        </nav>

        <Link
          href="/ara"
          className="flex items-center gap-2 text-gray-400 border rounded-lg px-3 py-1.5 text-sm hover:border-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Ara...
        </Link>
      </div>
    </header>
  );
}
