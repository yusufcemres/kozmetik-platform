export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <p className="text-sm text-gray-400 mb-4">Ürünler / {params.slug}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-gray-100 rounded-xl aspect-square flex items-center justify-center text-gray-300 text-6xl">
          📦
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{params.slug}</h1>
          <p className="text-gray-500 mb-6">Ürün detayları yüklenecek...</p>

          {/* Score badges placeholder */}
          <div className="space-y-3 mb-8">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-gray-600">Genel Uyum Skoru</p>
              <p className="text-2xl font-bold text-primary">--%</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Senin Cildine Uyumu</p>
              <p className="text-2xl font-bold text-blue-600">--%</p>
              <p className="text-xs text-gray-400 mt-1">
                Profil oluştur &rarr; kişisel skor gör
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INCI List */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">İçerik Listesi (INCI)</h2>
        <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
          İçerik analizi veritabanı kurulunca görünecek
        </div>
      </section>

      {/* Nereden Alınır */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">Nereden Alınır?</h2>
        <div className="bg-white border rounded-xl p-6">
          <div className="flex flex-wrap gap-4">
            <div className="border rounded-lg p-4 text-center min-w-[120px]">
              <p className="font-semibold text-sm">Trendyol</p>
              <p className="text-lg font-bold text-primary">--</p>
              <p className="text-xs text-primary mt-1">Git &rarr;</p>
            </div>
            <div className="border rounded-lg p-4 text-center min-w-[120px]">
              <p className="font-semibold text-sm">Hepsiburada</p>
              <p className="text-lg font-bold text-primary">--</p>
              <p className="text-xs text-primary mt-1">Git &rarr;</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Bağımsız platformuz, komisyon alınan linkler içerebilir.
          </p>
        </div>
      </section>
    </div>
  );
}
