'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { api } from '@/lib/api';

interface QcItem {
  id: number;
  name: string;
  detail?: string;
}

interface QcCheck {
  check: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
  items: QcItem[];
}

interface QcReport {
  generated_at: string;
  total_issues: number;
  critical: number;
  warnings: number;
  info: number;
  checks: QcCheck[];
}

const severityStyles: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
};

const severityLabel: Record<string, string> = {
  critical: 'Kritik',
  warning: 'Uyarı',
  info: 'Bilgi',
};

export default function QcReportPage() {
  const [report, setReport] = useState<QcReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());

  const fetchReport = () => {
    setLoading(true);
    api
      .get('/admin/qc/report')
      .then((res) => setReport(res.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const toggleCheck = (check: string) => {
    setExpandedChecks((prev) => {
      const next = new Set(prev);
      if (next.has(check)) next.delete(check);
      else next.add(check);
      return next;
    });
  };

  const downloadCsv = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/qc/report/csv`,
      '_blank',
    );
  };

  return (
    <div>
      <PageHeader
        title="Kalite Kontrol Raporu"
        description="Veritabanındaki tutarsızlıkları ve eksiklikleri tespit edin"
      />

      <div className="flex gap-3 mb-6">
        <button
          onClick={fetchReport}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
        >
          Yeniden Tara
        </button>
        <button
          onClick={downloadCsv}
          className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm"
        >
          CSV İndir
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Kontroller çalıştırılıyor...</div>
      ) : !report ? (
        <div className="text-center py-12 text-gray-400">
          Rapor yüklenemedi. API bağlantısını kontrol edin.
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-3xl font-bold">{report.total_issues}</p>
              <p className="text-sm text-gray-500">Toplam Sorun</p>
            </div>
            <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{report.critical}</p>
              <p className="text-sm text-red-500">Kritik</p>
            </div>
            <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{report.warnings}</p>
              <p className="text-sm text-orange-500">Uyarı</p>
            </div>
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{report.info}</p>
              <p className="text-sm text-blue-500">Bilgi</p>
            </div>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-400 mb-4">
            Oluşturulma: {new Date(report.generated_at).toLocaleString('tr-TR')}
          </p>

          {/* Checks */}
          <div className="space-y-3">
            {report.checks
              .sort((a, b) => {
                const order = { critical: 0, warning: 1, info: 2 };
                if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity];
                return b.count - a.count;
              })
              .map((check) => {
                const style = severityStyles[check.severity];
                const isExpanded = expandedChecks.has(check.check);

                return (
                  <div key={check.check} className={`${style.bg} border ${style.border} rounded-lg`}>
                    <button
                      onClick={() => check.count > 0 && toggleCheck(check.check)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${style.badge}`}>
                          {severityLabel[check.severity]}
                        </span>
                        <span className={`font-medium ${style.text}`}>{check.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${check.count === 0 ? 'text-green-600' : style.text}`}>
                          {check.count === 0 ? '✓' : check.count}
                        </span>
                        {check.count > 0 && (
                          <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </button>

                    {isExpanded && check.items.length > 0 && (
                      <div className="px-4 pb-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500 text-xs">
                              <th className="pb-1">ID</th>
                              <th className="pb-1">İsim</th>
                              <th className="pb-1">Detay</th>
                            </tr>
                          </thead>
                          <tbody>
                            {check.items.slice(0, 20).map((item) => (
                              <tr key={item.id} className="border-t border-gray-200/50">
                                <td className="py-1 text-gray-500">#{item.id}</td>
                                <td className="py-1">{item.name}</td>
                                <td className="py-1 text-gray-500">{item.detail || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {check.items.length > 20 && (
                          <p className="text-xs text-gray-400 mt-2">
                            ... ve {check.items.length - 20} kayıt daha (CSV ile tamamını indirin)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
