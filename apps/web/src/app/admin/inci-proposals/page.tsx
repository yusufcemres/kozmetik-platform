'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';

interface InciProposal {
  product_ingredient_id: number;
  product_id: number;
  ingredient_id: number | null;
  ingredient_display_name: string;
  inci_order_rank: number;
  created_at: string;
  product_name: string;
  product_slug: string;
  product_status: string;
  brand_name: string | null;
  inci_name: string | null;
  common_name: string | null;
  ingredient_slug: string | null;
  evidence_grade: string | null;
  allergen_flag: boolean;
  fragrance_flag: boolean;
}

export default function InciProposalsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InciProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<InciProposal[]>('/products/admin/inci-proposals', { token });
      setItems(data);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (!token) return;
    load();
  }, [token, load]);

  const toggleSelect = (id: number) => {
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const selectAll = () => setSelected(new Set(items.map((i) => i.product_ingredient_id)));
  const clearAll = () => setSelected(new Set());

  const approveOne = async (id: number) => {
    try {
      await api.post(`/products/admin/inci-proposals/${id}/approve`, {}, { token });
      toast('Onaylandı', 'success');
      load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Onaylanamadı', 'error'); }
  };

  const rejectOne = async (id: number) => {
    try {
      await api.delete(`/products/admin/inci-proposals/${id}`, { token });
      toast('Reddedildi', 'success');
      load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Reddedilemedi', 'error'); }
  };

  const bulkAction = async (action: 'approve' | 'reject') => {
    if (selected.size === 0) return;
    if (action === 'reject' && !confirm(`${selected.size} öneri silinsin mi?`)) return;
    setBusy(true);
    let ok = 0, fail = 0;
    for (const id of selected) {
      try {
        if (action === 'approve') await api.post(`/products/admin/inci-proposals/${id}/approve`, {}, { token });
        else await api.delete(`/products/admin/inci-proposals/${id}`, { token });
        ok++;
      } catch { fail++; }
    }
    toast(`${ok} ${action === 'approve' ? 'onaylandı' : 'reddedildi'}, ${fail} başarısız`, ok > 0 ? 'success' : 'error');
    setBusy(false);
    clearAll();
    load();
  };

  // Ürün bazlı gruplama
  const groups = items.reduce<Record<number, { product: InciProposal; items: InciProposal[] }>>((acc, it) => {
    if (!acc[it.product_id]) acc[it.product_id] = { product: it, items: [] };
    acc[it.product_id].items.push(it);
    return acc;
  }, {});

  if (!token) {
    return <div className="p-8 text-center text-on-surface-variant">Admin girişi gerekli.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">INCI Onerileri (Pending)</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kullanıcı taramalarından gelen INCI önerileri — public sayfada görünmez, onaylanınca ürün INCI listesine eklenir.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="px-4 py-2 text-sm border border-outline-variant rounded-md hover:bg-surface-container-low transition">
          {loading ? 'Yükleniyor…' : 'Yenile'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="curator-card p-4">
          <div className="text-2xl font-bold text-on-surface">{items.length}</div>
          <div className="text-xs text-outline">Toplam Öneri</div>
        </div>
        <div className="curator-card p-4">
          <div className="text-2xl font-bold text-primary">{Object.keys(groups).length}</div>
          <div className="text-xs text-outline">Etkilenen Ürün</div>
        </div>
        <div className="curator-card p-4">
          <div className="text-2xl font-bold text-green-600">{items.filter((i) => i.evidence_grade === 'A' || i.evidence_grade === 'B').length}</div>
          <div className="text-xs text-outline">Yüksek Evidence (A/B)</div>
        </div>
        <div className="curator-card p-4">
          <div className="text-2xl font-bold text-amber-600">{selected.size}</div>
          <div className="text-xs text-outline">Seçili</div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-md p-3">
          <span className="text-sm font-medium">{selected.size} öneri seçili</span>
          <button onClick={() => bulkAction('approve')} disabled={busy} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">Tümünü Onayla</button>
          <button onClick={() => bulkAction('reject')} disabled={busy} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">Tümünü Reddet</button>
          <button onClick={clearAll} className="ml-auto text-xs text-outline hover:text-on-surface">Seçimi temizle</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-outline">Yükleniyor…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-icon text-outline-variant block mb-3" style={{ fontSize: '48px' }}>inbox</span>
          <p className="text-on-surface-variant">Bekleyen öneri yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.values(groups).map((g) => (
            <div key={g.product.product_id} className="curator-card">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/30 bg-surface-container-low">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-outline uppercase tracking-wider">{g.product.brand_name || '-'} · {g.items.length} öneri</div>
                  <Link href={`/urunler/${g.product.product_slug}`} target="_blank" className="font-semibold text-on-surface hover:text-primary">
                    {g.product.product_name}
                  </Link>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-amber-100 text-amber-700">{g.product.product_status}</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {g.items.map((it) => (
                    <tr key={it.product_ingredient_id} className={`border-b border-outline-variant/10 ${selected.has(it.product_ingredient_id) ? 'bg-primary/5' : ''}`}>
                      <td className="px-3 py-2 w-8">
                        <input type="checkbox" checked={selected.has(it.product_ingredient_id)} onChange={() => toggleSelect(it.product_ingredient_id)} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-outline w-6">#{it.inci_order_rank}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-on-surface font-medium">{it.common_name || it.inci_name || it.ingredient_display_name}</div>
                            {it.ingredient_display_name !== (it.inci_name || it.common_name) && (
                              <div className="text-[10px] text-outline">Foto: "{it.ingredient_display_name}"</div>
                            )}
                          </div>
                          {it.evidence_grade && (
                            <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded ${
                              it.evidence_grade === 'A' ? 'bg-green-100 text-green-700' :
                              it.evidence_grade === 'B' ? 'bg-lime-100 text-lime-700' :
                              it.evidence_grade === 'C' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>{it.evidence_grade}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 w-24">
                        <div className="flex items-center gap-1">
                          <button onClick={() => approveOne(it.product_ingredient_id)} className="px-2 py-1 text-[11px] bg-green-600 text-white rounded hover:bg-green-700" title="Onayla">✓</button>
                          <button onClick={() => rejectOne(it.product_ingredient_id)} className="px-2 py-1 text-[11px] bg-red-600 text-white rounded hover:bg-red-700" title="Reddet">✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
