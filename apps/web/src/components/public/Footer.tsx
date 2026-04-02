import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-3">Kozmetik Platform</h3>
            <p className="text-sm">
              Kozmetik ürünlerin içeriklerini anla, ihtiyacına uygun ürünleri keşfet.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Keşfet</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/urunler" className="hover:text-white">Ürünler</Link></li>
              <li><Link href="/icerikler" className="hover:text-white">İçerik Maddeleri</Link></li>
              <li><Link href="/ihtiyaclar" className="hover:text-white">İhtiyaçlar</Link></li>
              <li><Link href="/rehber" className="hover:text-white">Rehber</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Hakkımızda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/hakkimizda" className="hover:text-white">Biz Kimiz?</Link></li>
              <li><Link href="/metodoloji" className="hover:text-white">Metodolojimiz</Link></li>
              <li><Link href="/iletisim" className="hover:text-white">İletişim</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Yasal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/gizlilik" className="hover:text-white">Gizlilik Politikası</Link></li>
              <li><Link href="/kullanim-kosullari" className="hover:text-white">Kullanım Koşulları</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} Kozmetik Platform. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
