export default function SupplementDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <p className="text-sm text-gray-400 mb-4">Takviyeler / {params.slug}</p>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">💊</span>
        <h1 className="text-3xl font-bold">{params.slug}</h1>
      </div>

      {/* Supplement Info */}
      <section className="mb-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Takviye Bilgileri</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Form</span>
            <p className="font-medium">-</p>
          </div>
          <div>
            <span className="text-gray-500">Porsiyon</span>
            <p className="font-medium">-</p>
          </div>
          <div>
            <span className="text-gray-500">Adet</span>
            <p className="font-medium">-</p>
          </div>
          <div>
            <span className="text-gray-500">Sertifika</span>
            <p className="font-medium">-</p>
          </div>
        </div>
      </section>

      {/* Nutrition Facts */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Besin Değerleri (Nutrition Facts)</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">İçerik</th>
                <th className="text-right px-4 py-2">Miktar</th>
                <th className="text-right px-4 py-2">% GRD</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3 text-gray-400" colSpan={3}>
                  Besin bilgileri seed data ile yüklenecek
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactions */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Etkileşimler</h2>
        <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
          Bu takviyenin diğer takviye ve ilaçlarla etkileşimleri listelenecek
        </div>
      </section>

      {/* Affiliate */}
      <section>
        <h2 className="text-xl font-bold mb-4">Nereden Alınır?</h2>
        <div className="bg-gray-50 rounded-lg p-6 text-gray-400 text-sm">
          Satın alma linkleri yüklenecek
        </div>
      </section>
    </div>
  );
}
