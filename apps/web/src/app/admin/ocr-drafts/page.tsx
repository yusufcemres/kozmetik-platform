'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';

interface OcrDraft {
  product_id: number;
  product_name: string;
  product_slug: string;
  barcode: string | null;
  status: string;
  short_description: string | null;
  net_content_value: number | null;
  net_content_unit: string | null;
  created_at: string;
  brand_id: number | null;
  brand_name: string | null;
  category_name: string | null;
  category_slug: string | null;
  ing_count: string;
  ing_matched: string;
  image_count: string;
  affiliate_count: string;
}

interface Brand { brand_id: number; brand_name: string; brand_slug: string; }
interface Category { category_id: number; category_name: string; category_slug: string; }

export default function OcrDraftsPage() {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<OcrDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<OcrDraft | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<OcrDraft[]>('/products/admin/ocr-drafts', { token });
      setDrafts(data);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (!token) return;
    load();
    // brand + category yukle (modal icin) — limit cap 200
    Promise.all([
      api.get<{ data: Brand[] }>('/brands?limit=200', { token }).catch(() => ({ data: [] })),
      api.get<Category[]>('/categories/tree', { token }).catch(() => []),
    ]).then(([b, c]) => {
      const bRes = b as { data?: Brand[] } | Brand[];
      const brandRows: Brand[] = Array.isArray(bRes) ? bRes : bRes.data || [];
      brandRows.sort((x, y) => (x.brand_name || '').localeCompare(y.brand_name || '', 'tr'));
      setBrands(brandRows);
      // Flatten category tree
      type CategoryNode = { category_id: number; category_name: string; category_slug: string; children?: CategoryNode[] };
      const flat: Category[] = [];
      const walk = (n: CategoryNode) => {
        flat.push({ category_id: n.category_id, category_name: n.category_name, category_slug: n.category_slug });
        (n.children || []).forEach(walk);
      };
      (c as CategoryNode[]).forEach(walk);
      setCategories(flat);
    });
  }, [token, load]);

  const saveEdit = async (patch: Partial<OcrDraft & { brand_id?: number; category_id?: number; product_name?: string; barcode?: string | null }>) => {
    if (!editing) return;
    try {
      await api.put(`/products/${editing.product_id}`, patch, { token });
      toast('Güncellendi', 'success');
      setEditing(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Güncellenemedi', 'error');
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(drafts.map((d) => d.product_id)));
  const clearAll = () => setSelected(new Set());

  const publishOne = async (id: number) => {
    try {
      await api.put(`/products/${id}/status`, { status: 'active' }, { token });
      toast('Yayınlandı', 'success');
      load();
      setSelected((p) => { const n = new Set(p); n.delete(id); return n; });
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Yayınlanamadı', 'error');
    }
  };

  const deleteOne = async (id: number) => {
    if (!confirm('Bu ürün silinsin mi? Geri alınamaz.')) return;
    try {
      await api.delete(`/products/${id}`, { token });
      toast('Silindi', 'success');
      load();
      setSelected((p) => { const n = new Set(p); n.delete(id); return n; });
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Silinemedi', 'error');
    }
  };

  const bulkPublish = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    let ok = 0, fail = 0;
    for (const id of selected) {
      try {
        await api.put(`/products/${id}/status`, { status: 'active' }, { token });
        ok++;
      } catch { fail++; }
    }
    toast(`${ok} yayınlandı, ${fail} başarısız`, ok > 0 ? 'success' : 'error');
    setBusy(false);
    clearAll();
    load();
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} ürün silinsin mi?`)) return;
    setBusy(true);
    let ok = 0, fail = 0;
    for (const id of selected) {
      try {
        await api.delete(`/products/${id}`, { token });
        ok++;
      } catch { fail++; }
    }
    toast(`${ok} silindi, ${fail} başarısız`, ok > 0 ? 'success' : 'error');
    setBusy(false);
    clearAll();
    load();
  };

  const qualityBadge = (d: OcrDraft) => {
    const ing = Number(d.ing_count);
    const matched = Number(d.ing_matched);
    if (ing >= 10 && matched >= 8 && d.brand_id && d.barcode) return { label: 'YÜKSEK', color: 'bg-green-100 text-green-700' };
    if (ing >= 5 && d.brand_id) return { label: 'ORTA', color: 'bg-amber-100 text-amber-700' };
    return { label: 'DÜŞÜK', color: 'bg-red-100 text-red-700' };
  };

  if (!token) {
    return <div className="p-8 text-center text-on-surface-variant">Admin girişi gerekli.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">OCR Draft Ürünler</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kamera/foto taramasından eklenmiş, admin onayı bekleyen ürünler (son 7 gün)
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 text-sm border border-outline-variant rounded-md hover:bg-surface-container-low transition"
        >
          {loading ? 'Yükleniyor…' : 'Yenile'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="curator-card p-4">
          <div className="text-2xl font-bold text-on-surface">{drafts.length}</div>
          <div className="text-xs text-outline">Toplam Draft</div>
        </div>
        <div className="curator-card p-4">
          <div className="text-2xl font-bold text-green-600">
            {drafts.filter((d) => Number(d.ing_count) >= 10).length}
          </div>
          <div className="text-xs text-outline">Yüksek Kalite (≥10 INCI)</div>
        </div>
        <div className="curator-card p-4">
          <div className="text-2xl font-bold text-amber-600">
            {drafts.filter((d) => d.barcode).length}
          </div>
          <div className="text-xs text-outline">Barkodlu</div>
        </div>
        <div className="curator-card p-4">
          <div className="text-2xl font-bold text-primary">{selected.size}</div>
          <div className="text-xs text-outline">Seçili</div>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-md p-3">
          <span className="text-sm font-medium text-on-surface">{selected.size} ürün seçili</span>
          <button
            onClick={bulkPublish}
            disabled={busy}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Tümünü Yayınla
          </button>
          <button
            onClick={bulkDelete}
            disabled={busy}
            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Tümünü Sil
          </button>
          <button
            onClick={clearAll}
            className="ml-auto text-xs text-outline hover:text-on-surface"
          >
            Seçimi temizle
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-outline">Yükleniyor…</div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-icon text-outline-variant block mb-3" style={{ fontSize: '48px' }}>inbox</span>
          <p className="text-on-surface-variant">OCR draft ürün yok</p>
        </div>
      ) : (
        <div className="curator-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/30">
              <tr>
                <th className="px-3 py-2 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === drafts.length && drafts.length > 0}
                    onChange={() => (selected.size === drafts.length ? clearAll() : selectAll())}
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-outline">Marka / Ürün</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-outline">Barkod</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-outline">INCI</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-outline">Kalite</th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-outline">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((d) => {
                const q = qualityBadge(d);
                const isSelected = selected.has(d.product_id);
                return (
                  <tr key={d.product_id} className={`border-b border-outline-variant/10 hover:bg-surface-container-low/50 ${isSelected ? 'bg-primary/5' : ''}`}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(d.product_id)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-outline">{d.brand_name || '-'}</div>
                      <div className="font-medium text-on-surface text-sm">{d.product_name}</div>
                      {d.category_name && <div className="text-[10px] text-outline mt-0.5">{d.category_name}</div>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{d.barcode || '-'}</td>
                    <td className="px-3 py-2">
                      <div className="text-sm">{d.ing_count}</div>
                      <div className="text-[10px] text-outline">{d.ing_matched} eşleşti</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${q.color}`}>{q.label}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        {/* Doğrulama linkleri — yayınlamadan önce online kontrol */}
                        <div className="flex items-center gap-1">
                          <a
                            href={`https://www.trendyol.com/sr?q=${encodeURIComponent((d.brand_name || '') + ' ' + (d.product_name || ''))}`}
                            target="_blank"
                            rel="noopener"
                            className="px-1.5 py-0.5 text-[10px] bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                            title="Trendyol'da ara"
                          >TY</a>
                          <a
                            href={`https://www.hepsiburada.com/ara?q=${encodeURIComponent((d.brand_name || '') + ' ' + (d.product_name || ''))}`}
                            target="_blank"
                            rel="noopener"
                            className="px-1.5 py-0.5 text-[10px] bg-orange-50 text-orange-600 rounded hover:bg-orange-100"
                            title="Hepsiburada'da ara"
                          >HB</a>
                          {d.barcode && (
                            <a
                              href={`https://world.openbeautyfacts.org/product/${d.barcode}`}
                              target="_blank"
                              rel="noopener"
                              className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              title="OpenBeautyFacts"
                            >OBF</a>
                          )}
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent('"' + (d.brand_name || '') + '" ' + (d.product_name || '') + (d.barcode ? ' ' + d.barcode : ''))}`}
                            target="_blank"
                            rel="noopener"
                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            title="Google'da ara"
                          >G</a>
                          <Link
                            href={`/urunler/${d.product_slug}`}
                            target="_blank"
                            className="px-1.5 py-0.5 text-[10px] border border-outline-variant rounded hover:bg-surface-container-low"
                            title="REVELA'da önizle"
                          >👁</Link>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditing(d)}
                            className="px-2 py-1 text-[11px] bg-blue-600 text-white rounded hover:bg-blue-700"
                            title="Düzenle"
                          >
                            ✏️ Düzenle
                          </button>
                          <button
                            onClick={() => publishOne(d.product_id)}
                            className="px-2 py-1 text-[11px] bg-green-600 text-white rounded hover:bg-green-700 flex-1"
                            title="Yayınla — sadece doğruladıktan sonra"
                          >
                            ✓ Yayınla
                          </button>
                          <button
                            onClick={() => deleteOne(d.product_id)}
                            className="px-2 py-1 text-[11px] bg-red-600 text-white rounded hover:bg-red-700"
                            title="Sil"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-surface rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface">Ürünü Düzenle #{editing.product_id}</h2>
              <button onClick={() => setEditing(null)} className="text-outline hover:text-on-surface text-xl">×</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const patch: Partial<OcrDraft & { brand_id?: number; category_id?: number; product_name?: string; barcode?: string | null; short_description?: string }> = {
                  product_name: String(fd.get('product_name') || '').trim() || undefined,
                  brand_id: fd.get('brand_id') ? Number(fd.get('brand_id')) : undefined,
                  category_id: fd.get('category_id') ? Number(fd.get('category_id')) : undefined,
                  barcode: String(fd.get('barcode') || '').trim() || null,
                  short_description: String(fd.get('short_description') || '').trim() || undefined,
                };
                saveEdit(patch);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs uppercase tracking-wider text-outline block mb-1">Ürün Adı</label>
                <input
                  name="product_name"
                  defaultValue={editing.product_name || ''}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-outline block mb-1">Marka</label>
                <select
                  name="brand_id"
                  defaultValue={editing.brand_id || ''}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface text-sm"
                >
                  <option value="">— seç —</option>
                  {brands.map((b) => (
                    <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-outline block mb-1">Kategori</label>
                <select
                  name="category_id"
                  defaultValue={categories.find((c) => c.category_name === editing.category_name)?.category_id || ''}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface text-sm"
                >
                  <option value="">— seç —</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-outline block mb-1">Barkod (boş bırak yoksa)</label>
                <input
                  name="barcode"
                  defaultValue={editing.barcode || ''}
                  placeholder="869..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-outline block mb-1">Kısa Açıklama</label>
                <textarea
                  name="short_description"
                  defaultValue={editing.short_description || ''}
                  rows={2}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface text-sm"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-sm border border-outline-variant rounded-md hover:bg-surface-container-low"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
