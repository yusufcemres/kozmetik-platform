'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import { getUserToken } from '@/lib/user-auth';
import { TrendChart, TrendDataPoint } from '@/components/skin-analysis/TrendChart';

/**
 * Tüm geçmiş analizler trend sayfası (Faz 2 #2).
 *
 * Token modu: reminder email'deki link → ?token=X → /history-by-token (auth'suz)
 * JWT modu: kayıtlı kullanıcı → /me/history
 *
 * Trend chart: genel skor sparkline + 6 boyut grid (3×2). En az 2 analiz şart.
 */
function TrendContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [data, setData] = useState<TrendDataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoggedIn = !!getUserToken();

  useEffect(() => {
    if (!token && !isLoggedIn) {
      setError('Trend grafiği için giriş yap ya da reminder email\'indeki bağlantıyı kullan.');
      setLoading(false);
      return;
    }
    const endpoint = token
      ? `/skin-analysis/history-by-token/${encodeURIComponent(token)}?limit=50`
      : '/skin-analysis/me/history?limit=50';
    apiFetch<any>(endpoint)
      .then((res) => {
        // /me/history → SkinAnalysisResult[] (entity shape), /history-by-token → typed map
        // Her ikisinde de scores + overall_score + created_at + analysis_id alanları var
        type TrendRow = { analysis_id: number | string; created_at: string | Date; scores: TrendDataPoint['scores']; overall_score: number };
        const rows: TrendDataPoint[] = (Array.isArray(res) ? res : []).map((r: TrendRow) => ({
          analysis_id: Number(r.analysis_id),
          created_at: typeof r.created_at === 'string' ? r.created_at : new Date(r.created_at).toISOString(),
          scores: r.scores,
          overall_score: r.overall_score,
        }));
        setData(rows);
      })
      .catch((err) => {
        let msg = err instanceof Error ? err.message : 'Geçmiş yüklenemedi';
        if (err instanceof ApiError) {
          if (err.status === 401) msg = 'Giriş yapman gerekiyor.';
          if (err.status === 404 && token) msg = 'Bağlantı geçersiz veya iptal edilmiş.';
        }
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [token, isLoggedIn]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
        <span className="mx-2 text-outline">/</span>
        <Link href="/cilt-analizi" className="hover:text-primary">Cilt Analizi</Link>
        <span className="mx-2 text-outline">/</span>
        <span className="text-on-surface">Trend</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface mb-2 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">timeline</span>
          Cilt Trendi
        </h1>
        <p className="text-sm text-on-surface-variant">
          Tüm analizlerinin zamana göre değişimi. Düşen skorlar (negatif delta) = iyileşme.
        </p>
      </header>

      {loading && (
        <div className="text-center py-16">
          <span className="material-icon animate-spin text-primary text-[32px] inline-block" aria-hidden="true">progress_activity</span>
          <p className="text-sm text-on-surface-variant mt-3">Geçmiş yükleniyor…</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-5 mb-6 text-center">
          <p className="text-sm text-amber-900 mb-3">{error}</p>
          <Link href="/cilt-analizi/foto-test" className="text-sm text-primary hover:underline">
            Yeni Analiz Çek →
          </Link>
        </div>
      )}

      {!loading && !error && data && data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-on-surface-variant mb-4">Henüz analiz yok.</p>
          <Link href="/cilt-analizi/foto-test" className="curator-btn-primary text-sm px-6 py-3 inline-block">
            İlk Analizi Çek
          </Link>
        </div>
      )}

      {!loading && !error && data && data.length > 0 && (
        <>
          <TrendChart analyses={data} />

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              href={token ? `/cilt-analizi/foto-test?token=${token}` : '/cilt-analizi/foto-test'}
              className="curator-btn-primary flex-1 text-sm py-3 text-center"
            >
              Yeni Analiz Çek
            </Link>
            {data.length >= 2 && (
              <Link
                href={token
                  ? `/cilt-analizi/karsilastir?token=${token}&to=${data[0].analysis_id}`
                  : `/cilt-analizi/karsilastir?to=${data[0].analysis_id}`}
                className="flex-1 text-sm text-center text-on-surface border border-primary/40 bg-primary/5 rounded-sm py-3 hover:bg-primary/10 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span className="material-icon material-icon-sm" aria-hidden="true">compare_arrows</span>
                Son İkiyi Karşılaştır
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function TrendPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16">
          <span className="material-icon animate-spin text-primary" aria-hidden="true">progress_activity</span>
        </div>
      }
    >
      <TrendContent />
    </Suspense>
  );
}
