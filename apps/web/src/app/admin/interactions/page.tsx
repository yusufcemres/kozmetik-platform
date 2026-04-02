'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { api } from '@/lib/api';

interface Interaction {
  interaction_id: number;
  ingredient_a: { inci_name: string };
  ingredient_b: { inci_name: string };
  severity: string;
  domain_type: string;
  description: string;
  recommendation: string;
}

const severityColor: Record<string, string> = {
  none: 'bg-gray-100 text-gray-600',
  mild: 'bg-yellow-100 text-yellow-700',
  moderate: 'bg-orange-100 text-orange-700',
  severe: 'bg-red-100 text-red-700',
  contraindicated: 'bg-red-200 text-red-800',
};

const severityLabel: Record<string, string> = {
  none: 'Yok',
  mild: 'Hafif',
  moderate: 'Orta',
  severe: 'Ciddi',
  contraindicated: 'Kontrendike',
};

export default function InteractionsPage() {
  const [data, setData] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [severityFilter, setSeverityFilter] = useState('');

  const fetchData = (p: number) => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(p), limit: '20' });
    if (severityFilter) qs.set('severity', severityFilter);
    api
      .get<{ data: Interaction[]; meta: { total: number } }>(`/interactions?${qs}`)
      .then((data) => {
        setData(data.data || []);
        setTotal(data.meta?.total || 0);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(page);
  }, [page, severityFilter]);

  return (
    <div>
      <PageHeader
        title="Ingredient Etkileşimleri"
        description="Kozmetik ve supplement ingredient etkileşim veritabanı"
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tüm Şiddetler</option>
          <option value="mild">Hafif</option>
          <option value="moderate">Orta</option>
          <option value="severe">Ciddi</option>
          <option value="contraindicated">Kontrendike</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Yükleniyor...</p>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">⚗️</p>
          <p>Etkileşim kaydı bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.interaction_id}
              className="bg-white rounded-lg border p-4 flex items-start gap-4"
            >
              <span className={`text-xs px-2 py-1 rounded font-medium ${severityColor[item.severity] || 'bg-gray-100'}`}>
                {severityLabel[item.severity] || item.severity}
              </span>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {item.ingredient_a?.inci_name || '?'}{' '}
                  <span className="text-gray-400">+</span>{' '}
                  {item.ingredient_b?.inci_name || '?'}
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                {item.recommendation && (
                  <p className="text-xs text-teal-600 mt-1">Öneri: {item.recommendation}</p>
                )}
              </div>
              <span className="text-xs text-gray-400">{item.domain_type}</span>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex justify-between items-center pt-4 text-sm text-gray-500">
            <span>Toplam: {total}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-30"
              >
                Önceki
              </button>
              <span className="px-3 py-1">Sayfa {page}</span>
              <button
                disabled={page * 20 >= total}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-30"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
