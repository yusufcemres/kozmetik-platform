'use client';

import { useCallback, useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { api } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';

interface Payment {
  payment_id: number;
  user_id: number;
  email: string | null;
  merchant_oid: string;
  plan_code: '29_one_time' | '49_monthly' | '490_yearly';
  amount_kurus: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  created_at: string;
  ipn_received_at: string | null;
  failure_reason: string | null;
}

interface Summary {
  total_revenue_kurus: number;
  total_payments_success: number;
  total_payments_pending: number;
  total_payments_failed: number;
  total_payments_refunded: number;
  total_premium_users: number;
  last_30d_revenue_kurus: number;
}

const PLAN_LABELS: Record<Payment['plan_code'], string> = {
  '29_one_time': '29 TL (one-time)',
  '49_monthly': '49 TL/ay',
  '490_yearly': '490 TL/yıl',
};

const STATUS_COLORS: Record<Payment['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

function formatTL(kurus: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(kurus / 100);
}

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const { toast } = useToast();
  const limit = 30;

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(page * limit),
      });
      if (statusFilter) params.set('status', statusFilter);
      if (planFilter) params.set('plan_code', planFilter);
      if (emailFilter) params.set('email', emailFilter);

      const [list, sum] = await Promise.all([
        api.get<{ items: Payment[]; total: number }>(`/payments/admin/list?${params}`, { token }),
        api.get<Summary>('/payments/admin/summary', { token }),
      ]);
      setItems(list.items);
      setTotal(list.total);
      setSummary(sum);
    } catch (err: any) {
      toast(err?.message || 'Yükleme hatası', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, planFilter, emailFilter, token, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefund = async (paymentId: number) => {
    const reason = prompt('İade nedeni:');
    if (!reason) return;
    if (!confirm(`Payment #${paymentId} iade edilecek + kullanıcının premium aboneliği iptal edilecek. Onaylıyor musun?`)) return;
    try {
      await api.post(`/payments/admin/${paymentId}/refund`, { reason }, { token });
      toast(`Payment #${paymentId} iade edildi`, 'success');
      load();
    } catch (err: any) {
      toast(err?.message || 'İade hatası', 'error');
    }
  };

  const handleGrantPremium = async () => {
    const userId = prompt('Kullanıcı ID:');
    if (!userId) return;
    const days = prompt('Kaç gün premium eklemek istiyorsun?', '30');
    if (!days) return;
    const reason = prompt('Sebep (kampanya/test/compensation):') || 'manuel grant';
    try {
      const res = await api.post(`/payments/admin/users/${userId}/grant-premium`, {
        days: parseInt(days, 10),
        reason,
      }, { token });
      toast(`User #${userId} premium until: ${new Date((res as any).premium_until).toLocaleString('tr-TR')}`, 'success');
      load();
    } catch (err: any) {
      toast(err?.message || 'Grant hatası', 'error');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader title="Ödemeler" description="PayTR ödeme kayıtları + manuel iade + premium grant" />

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="curator-card p-4">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Toplam Gelir</div>
            <div className="text-2xl font-bold">{formatTL(summary.total_revenue_kurus)}</div>
          </div>
          <div className="curator-card p-4">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Son 30 Gün</div>
            <div className="text-2xl font-bold">{formatTL(summary.last_30d_revenue_kurus)}</div>
          </div>
          <div className="curator-card p-4">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Aktif Premium</div>
            <div className="text-2xl font-bold">{summary.total_premium_users}</div>
          </div>
          <div className="curator-card p-4">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Durum Dağılımı</div>
            <div className="text-xs space-y-0.5">
              <div>✓ {summary.total_payments_success} başarılı</div>
              <div>⏳ {summary.total_payments_pending} bekliyor</div>
              <div>✗ {summary.total_payments_failed} başarısız</div>
              <div>↩ {summary.total_payments_refunded} iade</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 bg-surface border border-outline-variant/30 rounded-sm text-sm"
        >
          <option value="">Tüm durumlar</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 bg-surface border border-outline-variant/30 rounded-sm text-sm"
        >
          <option value="">Tüm planlar</option>
          <option value="29_one_time">29 TL one-time</option>
          <option value="49_monthly">49 TL/ay</option>
          <option value="490_yearly">490 TL/yıl</option>
        </select>
        <input
          type="text"
          placeholder="E-posta ara…"
          value={emailFilter}
          onChange={(e) => { setEmailFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 bg-surface border border-outline-variant/30 rounded-sm text-sm flex-1 min-w-[200px]"
        />
        <button
          type="button"
          onClick={handleGrantPremium}
          className="px-4 py-2 bg-primary text-on-primary rounded-sm text-sm hover:bg-primary/90"
        >
          + Manuel Premium Grant
        </button>
      </div>

      <div className="curator-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Kullanıcı</th>
              <th className="px-3 py-2 text-left">Plan</th>
              <th className="px-3 py-2 text-right">Tutar</th>
              <th className="px-3 py-2 text-left">Durum</th>
              <th className="px-3 py-2 text-left">Merchant OID</th>
              <th className="px-3 py-2 text-left">Tarih</th>
              <th className="px-3 py-2 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-on-surface-variant">Yükleniyor…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-on-surface-variant">Kayıt yok</td></tr>
            )}
            {items.map((p) => (
              <tr key={p.payment_id} className="border-t border-outline-variant/20">
                <td className="px-3 py-2 font-mono text-xs">{p.payment_id}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{p.email ?? `user_${p.user_id}`}</div>
                  <div className="text-xs text-on-surface-variant">#{p.user_id}</div>
                </td>
                <td className="px-3 py-2">{PLAN_LABELS[p.plan_code]}</td>
                <td className="px-3 py-2 text-right font-medium">{formatTL(p.amount_kurus)}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded-sm text-xs ${STATUS_COLORS[p.status]}`}>
                    {p.status}
                  </span>
                  {p.failure_reason && (
                    <div className="text-xs text-error mt-1 max-w-[200px] truncate" title={p.failure_reason}>
                      {p.failure_reason}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{p.merchant_oid}</td>
                <td className="px-3 py-2 text-xs">
                  <div>{new Date(p.created_at).toLocaleString('tr-TR')}</div>
                  {p.ipn_received_at && (
                    <div className="text-on-surface-variant">IPN: {new Date(p.ipn_received_at).toLocaleString('tr-TR')}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {p.status === 'success' && (
                    <button
                      type="button"
                      onClick={() => handleRefund(p.payment_id)}
                      className="text-xs text-error hover:underline"
                    >
                      İade et
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-on-surface-variant">
            Toplam {total} kayıt — Sayfa {page + 1}/{totalPages}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 bg-surface border border-outline-variant/30 rounded-sm disabled:opacity-50"
            >
              ‹ Önceki
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 bg-surface border border-outline-variant/30 rounded-sm disabled:opacity-50"
            >
              Sonraki ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
