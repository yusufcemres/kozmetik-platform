import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full py-10 sm:py-16 px-4 sm:px-6 lg:px-12 mt-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 items-start max-w-7xl mx-auto">
        {/* Brand */}
        <div>
          <div className="text-xl font-bold tracking-tight text-on-surface mb-6">REVELA</div>
          <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
            Kozmetik ürünlerin gerçek içeriğini ortaya çıkar. Bilimsel kanıtlarla desteklenen,
            bağımsız içerik analiz platformu.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <span className="label-caps text-on-surface font-bold text-xs">Keşfet</span>
            <Link href="/urunler" className="text-sm text-on-surface-variant hover:text-on-surface underline-offset-4 hover:underline transition-all">
              Ürünler
            </Link>
            <Link href="/icerikler" className="text-sm text-on-surface-variant hover:text-on-surface underline-offset-4 hover:underline transition-all">
              İçerik Maddeleri
            </Link>
            <Link href="/ihtiyaclar" className="text-sm text-on-surface-variant hover:text-on-surface underline-offset-4 hover:underline transition-all">
              İhtiyaçlar
            </Link>
            <Link href="/rehber" className="text-sm text-on-surface-variant hover:text-on-surface underline-offset-4 hover:underline transition-all">
              Rehber
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="label-caps text-on-surface font-bold text-xs">Destek</span>
            <Link href="/hakkimizda" className="text-sm text-on-surface-variant hover:text-on-surface underline-offset-4 hover:underline transition-all">
              Hakkımızda
            </Link>
            <Link href="/metodoloji" className="text-sm text-on-surface-variant hover:text-on-surface underline-offset-4 hover:underline transition-all">
              Metodoloji
            </Link>
            <Link href="/iletisim" className="text-sm text-on-surface-variant hover:text-on-surface underline-offset-4 hover:underline transition-all">
              İletişim
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-start md:items-end gap-6">
          <div className="flex gap-5">
            <span className="material-icon material-icon-sm text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors" aria-hidden="true">public</span>
            <span className="material-icon material-icon-sm text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors" aria-hidden="true">share</span>
            <span className="material-icon material-icon-sm text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors" aria-hidden="true">mail</span>
          </div>
          <p className="text-sm text-on-surface-variant text-left md:text-right">
            &copy; {new Date().getFullYear()} REVELA. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-4">
            <Link href="/gizlilik" className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
              Gizlilik Politikası
            </Link>
            <span className="text-outline-variant">/</span>
            <Link href="/kullanim-kosullari" className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
              Kullanım Koşulları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
