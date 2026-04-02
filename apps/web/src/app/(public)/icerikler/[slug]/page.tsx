export default function IngredientDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <p className="text-sm text-gray-400 mb-4">İçerikler / {params.slug}</p>

      <h1 className="text-3xl font-bold mb-2">{params.slug}</h1>
      <p className="text-gray-500 mb-8">İçerik detayları yüklenecek...</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Kanıt Seviyesi</p>
          <p className="text-lg font-bold">--</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Grup</p>
          <p className="text-lg font-bold">--</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500">Kaynak</p>
          <p className="text-lg font-bold">--</p>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Ne İşe Yarar?</h2>
        <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
          Detaylı açıklama yüklenecek...
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">İlgili İhtiyaçlar</h2>
        <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
          İlgili ihtiyaç eşleşmeleri gösterilecek
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Bilimsel Kaynaklar</h2>
        <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
          Evidence links gösterilecek
        </div>
      </section>
    </div>
  );
}
