'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import { api } from '@/lib/api';

interface QcCheck {
  check: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
}

interface QcReport {
  total_issues: number;
  critical: number;
  warnings: number;
  info: number;
  checks: QcCheck[];
}

const severityColor: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-orange-400',
  info: 'bg-blue-400',
};

const severityLabel: Record<string, string> = {
  critical: 'Kritik',
  warning: 'Uyarı',
  info: 'Bilgi',
};

export default function AdminDashboard() {
  const [qc, setQc] = useState<QcReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/qc/report')
      .then((res) => setQc(res.data))
      .catch(() => setQc(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Toplam Ürün" value="-" icon="📦" />
        <StatCard label="İçerik Maddesi" value="-" icon="🧪" />
        <StatCard label="İhtiyaç" value="-" icon="🎯" />
        <StatCard label="Makale" value="-" icon="📝" />
      </div>

      {/* QC Summary */}
      {qc && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{qc.critical}</p>
            <p className="text-sm text-red-500">Kritik Sorun</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{qc.warnings}</p>
            <p className="text-sm text-orange-500">Uyarı</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{qc.info}</p>
            <p className="text-sm text-blue-500">Bilgi</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">QC Kontrolleri</h2>
            <a href="/admin/qc" className="text-sm text-teal-600 hover:underline">
              Detaylı Rapor →
            </a>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm">Kontroller yükleniyor...</p>
          ) : qc ? (
            <ul className="space-y-2 text-sm">
              {qc.checks
                .filter((c) => c.count > 0)
                .sort((a, b) => {
                  const order = { critical: 0, warning: 1, info: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .slice(0, 8)
                .map((c) => (
                  <li key={c.check} className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${severityColor[c.severity]} rounded-full shrink-0`} />
                    <span className="text-gray-700">{c.description}</span>
                    <span className="ml-auto text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">
                      {c.count}
                    </span>
                  </li>
                ))}
              {qc.checks.filter((c) => c.count > 0).length === 0 && (
                <li className="text-green-600">Tüm kontroller temiz!</li>
              )}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">
              QC raporu yüklenemedi. API bağlantısını kontrol edin.
            </p>
          )}
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
