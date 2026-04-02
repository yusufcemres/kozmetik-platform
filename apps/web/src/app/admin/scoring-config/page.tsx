'use client';

import PageHeader from '@/components/admin/PageHeader';

export default function ScoringConfigPage() {
  return (
    <div>
      <PageHeader title="Scoring Konfigürasyonu" description="Ağırlıkları ve katsayıları düzenleyin" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">ProductRankScore Ağırlıkları</h3>
          <div className="space-y-3">
            {[
              { key: 'PRODUCT_NEED_COMPATIBILITY', label: 'Need Uyumu', value: 0.50 },
              { key: 'INGREDIENT_STRENGTH_MEAN', label: 'Ingredient Gücü', value: 0.20 },
              { key: 'LABEL_CONSISTENCY', label: 'Etiket Tutarlılığı', value: 0.15 },
              { key: 'CONTENT_COMPLETENESS', label: 'İçerik Tamlığı', value: 0.15 },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <label className="text-sm text-gray-600">{item.label}</label>
                <input
                  type="number"
                  step="0.05"
                  defaultValue={item.value}
                  className="w-20 border rounded px-2 py-1 text-sm text-right"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">Hassasiyet Cezaları</h3>
          <div className="space-y-3">
            {[
              { key: 'fragrance', label: 'Parfüm', value: 0.6 },
              { key: 'alcohol', label: 'Alkol', value: 0.7 },
              { key: 'paraben', label: 'Paraben', value: 0.8 },
              { key: 'essential_oils', label: 'Esansiyel Yağ', value: 0.75 },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <label className="text-sm text-gray-600">{item.label}</label>
                <input
                  type="number"
                  step="0.05"
                  defaultValue={item.value}
                  className="w-20 border rounded px-2 py-1 text-sm text-right"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
