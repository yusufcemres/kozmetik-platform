export default function NeedDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <p className="text-sm text-gray-400 mb-4">İhtiyaçlar / {params.slug}</p>

      <h1 className="text-3xl font-bold mb-4">{params.slug}</h1>
      <p className="text-gray-500 mb-8">İhtiyaç detayları yüklenecek...</p>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Bu İhtiyaç İçin Etkili İçerikler</h2>
        <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
          En yüksek relevance skoruna sahip ingredient&apos;ler listelenecek
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Uyumlu Ürünler</h2>
        <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
          Bu ihtiyaç için en yüksek uyum skoruna sahip ürünler listelenecek
        </div>
      </section>
    </div>
  );
}
