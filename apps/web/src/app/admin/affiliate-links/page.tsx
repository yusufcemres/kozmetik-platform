'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { api } from '@/lib/api';

interface AffiliateMetrics {
  total_links: number;
  links_with_price: number;
  stale_prices: number;
  platform_breakdown: Array<{ platform: string; count: string }>;
}

interface PriceAlert {
  affiliate_link_id: number;
  platform: string;
  product_id: number;
  old_price: number;
  new_price: number;
  drop_percent: number;
}

const platformLabels: Record<string, string> = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  amazon_tr: 'Amazon TR',
  gratis: 'Gratis',
  dermoeczanem: 'Dermoeczanem',
};

const platformColors: Record<string, string> = {
  trendyol: 'bg-orange-100 text-orange-700',
  hepsiburada: 'bg-blue-100 text-blue-700',
  amazon_tr: 'bg-yellow-100 text-yellow-700',
  gratis: 'bg-pink-100 text-pink-700',
  dermoeczanem: 'bg-green-100 text-green-700',
};

const columns = [
  { key: 'affiliate_link_id', label: 'ID' },
  { key: 'product_id', label: 'Ürün ID' },
  {
    key: 'platform',
    label: 'Platform',
    render: (v: string) => (
      <span className={`px-2 py-1 rounded text-xs ${platformColors[v] || 'bg-gray-100 text-gray-700'}`}>
        {platformLabels[v] || v}
      </span>
    ),
  },
  {
    key: 'price_snapshot',
    label: 'Fiyat',
    render: (v: number) => v ? `₺${Number(v).toFixed(2)}` : '-',
  },
  {
    key: 'price_updated_at',
    label: 'Son Güncelleme',
    render: (v: string) => {
      if (!v) return <span className="text-red-500 text-xs">Hiç güncellenmedi</span>;
      const date = new Date(v);
      const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      const color = diffDays > 7 ? 'text-red-500' : diffDays > 3 ? 'text-yellow-600' : 'text-green-600';
      return <span className={`text-xs ${color}`}>{date.toLocaleDateString('tr-TR')} ({diffDays} gün)</span>;
    },
  },
  {
    key: 'is_active',
    label: 'Durum',
    render: (v: boolean) => (
      <span className={`px-2 py-1 rounded text-xs ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {v ? 'Aktif' : 'Pasif'}
      </span>
    ),
  },
];

function MetricCard({ label, value, color = 'blue', icon }: { label: string; value: string | number; color?: string; icon: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };
  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function AffiliateLinksPage() {
  const [metrics, setMetrics] = useState<AffiliateMetrics | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [updating, setUpdating] = useState(false);
  const [tab, setTab] = useState<'overview' | 'links' | 'alerts'>('overview');

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [m, a] = await Promise.all([
        api.get<AffiliateMetrics>('/admin/affiliate/metrics', { token }),
        api.get<PriceAlert[]>('/admin/affiliate/price-alerts', { token }),
      ]);
      setMetrics(m);
      setAlerts(a);
    } catch {
      // API not available yet
    }
  }

  async function handleBatchUpdate() {
    setUpdating(true);
    try {
      await api.post('/admin/affiliate/update-prices', {}, { token });
      await loadData();
    } catch {
      // handle error
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Affiliate & Fiyat Takip"
        description="Ürün satın alma linkleri, fiyat takibi ve gelir yönetimi"
        action={{
          label: updating ? 'Güncelleniyor...' : 'Tüm Fiyatları Güncelle',
          onClick: handleBatchUpdate,
        }}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: 'overview' as const, label: 'Genel Bakış' },
          { key: 'links' as const, label: 'Linkler' },
          { key: 'alerts' as const, label: `Fiyat Düşüşleri${alerts.length ? ` (${alerts.length})` : ''}` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon="🔗"
              label="Toplam Aktif Link"
              value={metrics?.total_links ?? '-'}
              color="blue"
            />
            <MetricCard
              icon="💰"
              label="Fiyatlı Linkler"
              value={metrics?.links_with_price ?? '-'}
              color="green"
            />
            <MetricCard
              icon="⚠️"
              label="Eski Fiyatlar (7+ gün)"
              value={metrics?.stale_prices ?? '-'}
              color={metrics && metrics.stale_prices > 0 ? 'red' : 'yellow'}
            />
            <MetricCard
              icon="📉"
              label="Fiyat Düşüşü (24s)"
              value={alerts.length}
              color={alerts.length > 0 ? 'green' : 'blue'}
            />
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Platform Dağılımı</h3>
            {metrics?.platform_breakdown && metrics.platform_breakdown.length > 0 ? (
              <div className="space-y-3">
                {metrics.platform_breakdown.map((ps) => {
                  const total = metrics.total_links || 1;
                  const count = parseInt(ps.count);
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={ps.platform} className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs w-28 text-center ${platformColors[ps.platform] || 'bg-gray-100'}`}>
                        {platformLabels[ps.platform] || ps.platform}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4">
                        <div
                          className="bg-teal-500 h-4 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-20 text-right">{count} link ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Henüz veri yok</p>
            )}
          </div>

          {/* Recent Price Alerts */}
          {alerts.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Son Fiyat Düşüşleri</h3>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((a) => (
                  <div key={a.affiliate_link_id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600 font-bold text-lg">↓{a.drop_percent}%</span>
                    <span className={`px-2 py-1 rounded text-xs ${platformColors[a.platform] || 'bg-gray-100'}`}>
                      {platformLabels[a.platform] || a.platform}
                    </span>
                    <span className="text-sm text-gray-600">Ürün #{a.product_id}</span>
                    <span className="text-sm line-through text-gray-400">₺{a.old_price.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-green-700">₺{a.new_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Links Tab */}
      {tab === 'links' && (
        <AdminTable columns={columns} data={[]} onEdit={() => {}} onDelete={() => {}} />
      )}

      {/* Alerts Tab */}
      {tab === 'alerts' && (
        <div className="bg-white border rounded-lg">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-2">📊</p>
              <p>Son 24 saatte %5 üzeri fiyat düşüşü tespit edilmedi</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 text-xs text-gray-500 uppercase">Platform</th>
                  <th className="text-left p-3 text-xs text-gray-500 uppercase">Ürün ID</th>
                  <th className="text-right p-3 text-xs text-gray-500 uppercase">Eski Fiyat</th>
                  <th className="text-right p-3 text-xs text-gray-500 uppercase">Yeni Fiyat</th>
                  <th className="text-right p-3 text-xs text-gray-500 uppercase">Düşüş</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.affiliate_link_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${platformColors[a.platform] || 'bg-gray-100'}`}>
                        {platformLabels[a.platform] || a.platform}
                      </span>
                    </td>
                    <td className="p-3 text-sm">#{a.product_id}</td>
                    <td className="p-3 text-sm text-right line-through text-gray-400">₺{a.old_price.toFixed(2)}</td>
                    <td className="p-3 text-sm text-right font-semibold text-green-700">₺{a.new_price.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 font-bold">
                        ↓{a.drop_percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
