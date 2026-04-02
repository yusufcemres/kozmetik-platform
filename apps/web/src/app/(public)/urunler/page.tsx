import Link from 'next/link';

export default function ProductsListPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Ürünler</h1>
      <p className="text-gray-500 mb-8">
        Kozmetik ürünlerini incele, içeriklerini analiz et
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>Tüm Markalar</option>
        </select>
        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>Tüm Kategoriler</option>
        </select>
        <select className="border rounded-lg px-3 py-2 text-sm">
          <option>Sıralama: Yeni</option>
        </select>
      </div>

      {/* Product grid placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-xl p-6 text-center text-gray-400">
          <p className="text-4xl mb-2">📦</p>
          <p className="text-sm">Ürünler veritabanı kurulunca burada listelenecek</p>
        </div>
      </div>
    </div>
  );
}
