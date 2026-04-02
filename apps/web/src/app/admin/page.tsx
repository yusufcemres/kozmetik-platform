'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

interface AffiliateMetrics {
  total_links: number;
  stale_prices: number;
  platform_breakdown: Array<{ platform: string; count: string }>;
}

interface B2bMetrics {
  total_keys: number;
  active_keys: number;
  active_webhooks: number;
}

const severityColor: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-orange-400',
  info: 'bg-blue-400',
};

export default function AdminDashboard() {
  const [qc, setQc] = useState<QcReport | null>(null);
  const [affiliate, setAffiliate] = useState<AffiliateMetrics | null>(null);
  const [b2b, setB2b] = useState<B2bMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  useEffect(() => {
    Promise.allSettled([
      api.get<QcReport>('/admin/qc/report', { token }),
      api.get<AffiliateMetrics>('/admin/affiliate/metrics', { token }),
      api.get<B2bMetrics>('/admin/b2b/metrics', { token }),
    ]).then(([qcRes, affRes, b2bRes]) => {
      if (qcRes.status === 'fulfilled') setQc(qcRes.value);
      if (affRes.status === 'fulfilled') setAffiliate(affRes.value);
      if (b2bRes.status === 'fulfilled') setB2b(b2bRes.value);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Toplam Ürün" value="-" icon="📦" />
        <StatCard label="İçerik Maddesi" value="-" icon="🧪" />
        <StatCard label="İhtiyaç" value="-" icon="🎯" />
        <StatCard label="Makale" value="-" icon="📝" />
      </div>

      {/* QC + Affiliate + B2B Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{qc?.critical ?? '-'}</p>
          <p className="text-xs text-red-500">Kritik QC</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{qc?.warnings ?? '-'}</p>
          <p className="text-xs text-orange-500">Uyarı</p>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-teal-600">{affiliate?.total_links ?? '-'}</p>
          <p className="text-xs text-teal-500">Affiliate Link</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{affiliate?.stale_prices ?? '-'}</p>
          <p className="text-xs text-yellow-500">Eski Fiyat</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{b2b?.active_keys ?? '-'}</p>
          <p className="text-xs text-blue-500">B2B Key</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{b2b?.active_webhooks ?? '-'}</p>
          <p className="text-xs text-purple-500">Webhook</p>
        </div>
      </div>

      {/* Detail Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QC Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">QC Kontrolleri</h2>
            <Link href="/admin/qc" className="text-sm text-teal-600 hover:underline">Detay →</Link>
          </div>
          {loading ? (
            <p className="text-gray-400 text-sm">Yükleniyor...</p>
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
                    <span className="ml-auto text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">{c.count}</span>
                  </li>
                ))}
              {qc.checks.filter((c) => c.count > 0).length === 0 && (
                <li className="text-green-600">Tüm kontroller temiz!</li>
              )}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">QC raporu yüklenemedi.</p>
          )}
        </div>

        {/* Quick Links Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-lg mb-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/products', label: 'Ürünler', icon: '📦', desc: 'Ürün CRUD' },
              { href: '/admin/ingredients', label: 'İçerikler', icon: '🧪', desc: 'INCI yönetimi' },
              { href: '/admin/affiliate-links', label: 'Affiliate', icon: '💰', desc: 'Fiyat takip' },
              { href: '/admin/b2b', label: 'B2B API', icon: '🔑', desc: 'Key yönetimi' },
              { href: '/admin/review-queue', label: 'Review Queue', icon: '👁️', desc: 'Onay bekleyen' },
              { href: '/admin/scoring-config', label: 'Scoring', icon: '⚙️', desc: 'Skor ayarları' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        {affiliate?.platform_breakdown && affiliate.platform_breakdown.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Platform Dağılımı</h2>
              <Link href="/admin/affiliate-links" className="text-sm text-teal-600 hover:underline">Detay →</Link>
            </div>
            <div className="space-y-3">
              {affiliate.platform_breakdown.map((ps) => {
                const count = parseInt(ps.count);
                const total = affiliate.total_links || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={ps.platform} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-28 capitalize">{ps.platform.replace('_', ' ')}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div className="bg-teal-500 h-3 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-lg mb-4">Sistem Bilgisi</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">API</span>
              <span className="font-mono">NestJS + TypeORM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Frontend</span>
              <span className="font-mono">Next.js 14 (App Router)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">DB</span>
              <span className="font-mono">PostgreSQL 15 + pg_trgm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cache</span>
              <span className="font-mono">Redis 7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Entity</span>
              <span className="font-mono">37 tablo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Modül</span>
              <span className="font-mono">20 NestJS modül</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
