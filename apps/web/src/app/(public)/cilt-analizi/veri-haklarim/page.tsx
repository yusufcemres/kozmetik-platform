'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import { getUserToken } from '@/lib/user-auth';

/**
 * KVKK Madde 11 — Veri Hakları sayfası (Faz 1 Gün 10).
 *
 * Kullanıcı:
 *  - (d) Veri taşınabilirlik — tüm cilt analizlerini JSON olarak indirir
 *  - (e+f) Veri silme — tüm cilt analizlerini geri dönüşsüz siler
 *
 * Auth gerekli (magic link ile giriş yapmış kullanıcı). Anonim analizler
 * için silme: 28-gün reminder email içindeki unsubscribe link veya yeni
 * analiz çekip eski'leri eskitme.
 */
export default function VeriHaklarimPage() {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const isLoggedIn = !!getUserToken();

  const handleExport = async () => {
    setMsg(null);
    setExporting(true);
    try {
      const data = await apiFetch<any>('/skin-analysis/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revela-cilt-analiz-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg({ type: 'success', text: `${data.analyses?.length ?? 0} analiz JSON dosyası indirildi.` });
    } catch (err) {
      const message = err instanceof ApiError && err.status === 401
        ? 'Giriş yapman gerekiyor.'
        : err instanceof Error ? err.message : 'Export başarısız';
      setMsg({ type: 'error', text: message });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setMsg(null);
    setDeleting(true);
    try {
      const res = await apiFetch<{ deleted: number }>('/skin-analysis/me/delete-all', { method: 'DELETE' });
      setMsg({ type: 'success', text: `${res.deleted} kayıt geri dönüşsüz silindi.` });
      setConfirmDelete(false);
    } catch (err) {
      const message = err instanceof ApiError && err.status === 401
        ? 'Giriş yapman gerekiyor.'
        : err instanceof Error ? err.message : 'Silme başarısız';
      setMsg({ type: 'error', text: message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <nav className="text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
        <span className="mx-2 text-outline">/</span>
        <Link href="/cilt-analizi" className="hover:text-primary">Cilt Analizi</Link>
        <span className="mx-2 text-outline">/</span>
        <span className="text-on-surface">Veri Haklarım</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">policy</span>
          KVKK Veri Haklarım
        </h1>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          KVKK Madde 11 kapsamında cilt analizi verilerini dilediğin zaman dışa aktarabilir
          (taşınabilirlik) veya kalıcı olarak silebilirsin (unutulma hakkı).
        </p>
      </header>

      {!isLoggedIn && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 mb-6 text-sm text-amber-900">
          <p className="font-semibold mb-1">Giriş gerekli</p>
          <p className="text-xs leading-relaxed">
            Veri haklarını yönetmek için önce magic link ile giriş yap.
            {' '}
            <Link href="/giris" className="text-primary hover:underline font-medium">Giriş yap →</Link>
          </p>
        </div>
      )}

      {msg && (
        <div
          className={`p-4 rounded-sm mb-6 text-sm ${
            msg.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-error/5 border border-error/20 text-error'
          }`}
          role="status"
        >
          <span className="material-icon text-[16px] align-middle mr-1" aria-hidden="true">
            {msg.type === 'success' ? 'check_circle' : 'error_outline'}
          </span>
          {msg.text}
        </div>
      )}

      {/* Export */}
      <section className="curator-card p-5 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="material-icon text-primary text-[24px] shrink-0" aria-hidden="true">file_download</span>
          <div className="flex-1">
            <h2 className="font-bold text-on-surface mb-1">Verilerimi İndir (Madde 11/d)</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Tüm cilt analizlerinin JSON formatında dışa aktarımı — taşınabilirlik hakkı kapsamında.
              Dosyada skorlar, öneriler, tarihler ve model versiyonları var (foto yok, biyometrik veri
              hiç saklanmıyor).
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={!isLoggedIn || exporting}
          className="curator-btn-primary text-xs px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting ? 'Hazırlanıyor…' : 'JSON Olarak İndir'}
        </button>
      </section>

      {/* Delete */}
      <section className="curator-card p-5 mb-4 border-error/20">
        <div className="flex items-start gap-3 mb-3">
          <span className="material-icon text-error text-[24px] shrink-0" aria-hidden="true">delete_forever</span>
          <div className="flex-1">
            <h2 className="font-bold text-on-surface mb-1">Tüm Verilerimi Sil (Madde 11/e+f)</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>Bu işlem geri alınamaz.</strong> Tüm cilt analizlerin (skor + öneri + foto blob varsa) ve
              email kaydın kalıcı olarak silinir. Hesabın açık kalır — sadece skin-analysis verilerin gider.
            </p>
          </div>
        </div>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={!isLoggedIn}
            className="text-xs text-error border border-error/40 rounded-sm px-4 py-2 hover:bg-error/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Silme talebi başlat
          </button>
        ) : (
          <div className="bg-error/5 border border-error/30 rounded-sm p-3 space-y-2">
            <p className="text-xs text-on-surface font-medium">
              Emin misin? Tüm skin-analysis kayıtların geri dönüşsüz silinecek.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs bg-error text-on-primary px-4 py-2 rounded-sm hover:bg-error/90 disabled:opacity-60"
              >
                {deleting ? 'Siliniyor…' : 'Evet, geri dönüşsüz sil'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="text-xs text-on-surface-variant border border-outline-variant/40 px-4 py-2 rounded-sm hover:bg-surface-container-low"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Bilgi */}
      <section className="bg-surface-container-low rounded-sm p-4 text-xs text-on-surface-variant leading-relaxed">
        <p className="font-semibold text-on-surface mb-1">Diğer haklarınız (Madde 11):</p>
        <ul className="list-disc list-inside space-y-1">
          <li>(a) Veri işlenip işlenmediğini öğrenme → bu sayfa veri varlığını gösterir.</li>
          <li>(b) Bilgi talep etme → JSON export tüm işlenen veriyi içerir.</li>
          <li>(c) İşleme amacını öğrenme → foto analiz başlamadan KVKK modal'da açıklanıyor.</li>
          <li>(g) Düzeltme → yanlış analiz için yeni foto çekerek güncel skor üretebilirsin.</li>
        </ul>
        <p className="mt-2">
          Detaylı talepler için: <a href="mailto:yusufcemresan@gmail.com" className="text-primary hover:underline">yusufcemresan@gmail.com</a>
        </p>
      </section>
    </div>
  );
}
