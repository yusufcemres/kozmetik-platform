'use client';

import StatCard from '@/components/admin/StatCard';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Toplam Ürün" value="-" icon="📦" />
        <StatCard label="İçerik Maddesi" value="-" icon="🧪" />
        <StatCard label="İhtiyaç" value="-" icon="🎯" />
        <StatCard label="Makale" value="-" icon="📝" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-lg mb-4">QC Uyarıları</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Ingredient listesi olmayan ürünler
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
              Skoru hesaplanmamış ürünler
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              Affiliate linksiz ürünler
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
              Review queue bekleyenler
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-lg mb-4">Son Aktivite</h2>
          <p className="text-gray-400 text-sm">
            DB bağlantısı sonrası son 24 saat değişiklikleri görünecek.
          </p>
        </div>
      </div>
    </div>
  );
}
