import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kozmetik Ürünlerini Anla
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            INCI listesini analiz et, cildine uygun ürünleri keşfet.
            Bilimsel kanıta dayalı, bağımsız ve Türkçe.
          </p>

          <div className="max-w-xl mx-auto">
            <Link
              href="/ara"
              className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-6 py-4 text-gray-400 hover:border-primary transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Ürün, içerik veya cilt ihtiyacı ara...
            </Link>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            href="/urunler"
            className="bg-white border rounded-xl p-8 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-3xl mb-4">📦</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary">Ürünler</h2>
            <p className="text-gray-500 text-sm">
              Kozmetik ürünleri incele, içeriklerini analiz et ve ihtiyacına uygunluğunu kontrol et.
            </p>
          </Link>

          <Link
            href="/icerikler"
            className="bg-white border rounded-xl p-8 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-3xl mb-4">🧪</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary">İçerik Maddeleri</h2>
            <p className="text-gray-500 text-sm">
              Niacinamide, Retinol, Hyaluronic Acid... Her içerik maddesini bilimsel kaynaklarıyla öğren.
            </p>
          </Link>

          <Link
            href="/ihtiyaclar"
            className="bg-white border rounded-xl p-8 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-3xl mb-4">🎯</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary">Cilt İhtiyaçları</h2>
            <p className="text-gray-500 text-sm">
              Sivilce, leke, kırışıklık, kuruluk... İhtiyacına göre en etkili içerikleri ve ürünleri bul.
            </p>
          </Link>
        </div>
      </section>

      {/* Profile CTA */}
      <section className="bg-primary/5 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Cilt Profilini Oluştur</h2>
          <p className="text-gray-600 mb-6">
            Cilt tipini, ihtiyaçlarını ve hassasiyetlerini belirle.
            Her ürün sayfasında sana özel uyum skoru gör.
          </p>
          <Link
            href="/profilim"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Profilimi Oluştur
          </Link>
        </div>
      </section>
    </div>
  );
}
