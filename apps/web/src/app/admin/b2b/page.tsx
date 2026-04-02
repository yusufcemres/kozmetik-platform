'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { api } from '@/lib/api';

interface ApiKeyItem {
  api_key_id: number;
  company_name: string;
  contact_email: string;
  key_prefix: string;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  total_requests: number;
  last_request_at: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface B2bMetrics {
  total_keys: number;
  active_keys: number;
  active_webhooks: number;
  top_consumers: Array<{
    company_name: string;
    key_prefix: string;
    total_requests: number;
    last_request_at: string | null;
  }>;
}

interface NewKeyForm {
  company_name: string;
  contact_email: string;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
}

export default function B2bPage() {
  const [metrics, setMetrics] = useState<B2bMetrics | null>(null);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [form, setForm] = useState<NewKeyForm>({
    company_name: '',
    contact_email: '',
    rate_limit_per_hour: 1000,
    rate_limit_per_day: 10000,
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [m, k] = await Promise.all([
        api.get<B2bMetrics>('/admin/b2b/metrics', { token }),
        api.get<ApiKeyItem[]>('/admin/b2b/api-keys', { token }),
      ]);
      setMetrics(m);
      setKeys(k);
    } catch {
      // API not available yet
    }
  }

  async function handleCreate() {
    try {
      const result = await api.post<{ api_key: string }>('/admin/b2b/api-keys', form, { token });
      setNewKey(result.api_key);
      setShowForm(false);
      setForm({ company_name: '', contact_email: '', rate_limit_per_hour: 1000, rate_limit_per_day: 10000 });
      await loadData();
    } catch {
      // handle error
    }
  }

  async function handleRevoke(id: number) {
    if (!confirm('Bu API key iptal edilecek. Devam edilsin mi?')) return;
    try {
      await api.delete(`/admin/b2b/api-keys/${id}`, { token });
      await loadData();
    } catch {
      // handle error
    }
  }

  return (
    <div>
      <PageHeader
        title="B2B API Yönetimi"
        description="API key'ler, rate limit'ler ve webhook yönetimi"
        action={{ label: 'Yeni API Key', onClick: () => setShowForm(true) }}
      />

      {/* New Key Alert */}
      {newKey && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="font-semibold text-yellow-800 mb-2">API Key oluşturuldu! Bu anahtarı kopyalayın — tekrar gösterilmez.</p>
          <code className="block p-3 bg-white border rounded font-mono text-sm break-all">{newKey}</code>
          <button onClick={() => { navigator.clipboard.writeText(newKey); }} className="mt-2 text-sm text-blue-600 hover:underline">
            Kopyala
          </button>
          <button onClick={() => setNewKey(null)} className="mt-2 ml-4 text-sm text-gray-500 hover:underline">
            Kapat
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">Toplam Key</p>
          <p className="text-2xl font-bold text-blue-800">{metrics?.total_keys ?? '-'}</p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">Aktif Key</p>
          <p className="text-2xl font-bold text-green-800">{metrics?.active_keys ?? '-'}</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-600">Aktif Webhook</p>
          <p className="text-2xl font-bold text-purple-800">{metrics?.active_webhooks ?? '-'}</p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-white border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Yeni API Key Oluştur</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="Firma adı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İletişim E-posta</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="email@firma.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saatlik Limit</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.rate_limit_per_hour}
                onChange={(e) => setForm({ ...form, rate_limit_per_hour: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gunluk Limit</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.rate_limit_per_day}
                onChange={(e) => setForm({ ...form, rate_limit_per_day: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} className="px-4 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700">
              Oluştur
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 text-xs text-gray-500 uppercase">Firma</th>
              <th className="text-left p-3 text-xs text-gray-500 uppercase">Key Prefix</th>
              <th className="text-right p-3 text-xs text-gray-500 uppercase">İstek</th>
              <th className="text-right p-3 text-xs text-gray-500 uppercase">Limit (saat/gün)</th>
              <th className="text-left p-3 text-xs text-gray-500 uppercase">Durum</th>
              <th className="text-left p-3 text-xs text-gray-500 uppercase">Son İstek</th>
              <th className="text-right p-3 text-xs text-gray-500 uppercase">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">Henüz API key oluşturulmadı</td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.api_key_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="text-sm font-medium">{k.company_name}</div>
                    <div className="text-xs text-gray-500">{k.contact_email}</div>
                  </td>
                  <td className="p-3 font-mono text-sm">{k.key_prefix}...</td>
                  <td className="p-3 text-right text-sm">{Number(k.total_requests).toLocaleString('tr-TR')}</td>
                  <td className="p-3 text-right text-sm text-gray-600">
                    {k.rate_limit_per_hour.toLocaleString()} / {k.rate_limit_per_day.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${k.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {k.is_active ? 'Aktif' : 'İptal'}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {k.last_request_at ? new Date(k.last_request_at).toLocaleString('tr-TR') : '-'}
                  </td>
                  <td className="p-3 text-right">
                    {k.is_active && (
                      <button
                        onClick={() => handleRevoke(k.api_key_id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        İptal Et
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Top Consumers */}
      {metrics?.top_consumers && metrics.top_consumers.length > 0 && (
        <div className="mt-6 bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">En Aktif Kullanıcılar</h3>
          <div className="space-y-2">
            {metrics.top_consumers.map((c, i) => (
              <div key={c.key_prefix} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                <span className="text-sm font-medium flex-1">{c.company_name}</span>
                <span className="font-mono text-xs text-gray-500">{c.key_prefix}...</span>
                <span className="text-sm font-semibold">{Number(c.total_requests).toLocaleString('tr-TR')} istek</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
