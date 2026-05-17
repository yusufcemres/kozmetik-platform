'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { fileToResizedBase64 } from '@/lib/barcode';
import { smartScan } from '@/lib/smart-scan';

interface AnalysisToken {
  rank: number;
  raw: string;
  matched: boolean;
  confidence?: number;
  ingredient?: {
    ingredient_id: number;
    inci_name: string;
    common_name?: string | null;
    ingredient_slug?: string;
    function_summary?: string;
    evidence_grade?: 'A' | 'B' | 'C' | 'D' | 'F' | null;
    safety_class?: string | null;
    allergen_flag?: boolean;
    fragrance_flag?: boolean;
    eu_banned?: boolean;
    cmr_class?: string | null;
  };
}

interface AnalysisSummary {
  total: number;
  matched: number;
  unmatched: number;
  allergens: number;
  fragrances: number;
  cmr: number;
  eu_banned: number;
  kathon: number;
  score: number;
  verdict: 'çok iyi' | 'iyi' | 'orta' | 'riskli' | 'tehlikeli';
}

interface AnalysisResponse {
  tokens: AnalysisToken[];
  summary: AnalysisSummary;
}

const EXAMPLE_INCI = `Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Tocopherol, Phenoxyethanol, Disodium EDTA, Citric Acid, Parfum, Methylisothiazolinone, CI 19140`;

function verdictColor(v: string) {
  if (v === 'çok iyi') return 'bg-green-600 text-white';
  if (v === 'iyi') return 'bg-lime-600 text-white';
  if (v === 'orta') return 'bg-amber-500 text-white';
  if (v === 'riskli') return 'bg-orange-600 text-white';
  return 'bg-red-600 text-white';
}

function gradeColor(g?: string | null) {
  if (g === 'A') return 'text-green-700 bg-green-100';
  if (g === 'B') return 'text-lime-700 bg-lime-100';
  if (g === 'C') return 'text-amber-700 bg-amber-100';
  if (g === 'D') return 'text-orange-700 bg-orange-100';
  if (g === 'F') return 'text-red-700 bg-red-100';
  return 'text-outline bg-surface-container';
}

export default function InciAnalysisPage() {
  return (
    <Suspense fallback={<div className="curator-section max-w-[1200px] mx-auto py-8"><div className="animate-pulse h-32 bg-surface-container-low rounded" /></div>}>
      <InciAnalysisInner />
    </Suspense>
  );
}

function InciAnalysisInner() {
  const searchParams = useSearchParams();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Foto upload — etiket fotoğrafından INCI okuma (2026-05-18, smart-scan vision pipeline reuse)
  const [photoBusy, setPhotoBusy] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset
    setError(null);
    setPhotoBusy(true);
    try {
      const { base64, mime } = await fileToResizedBase64(file, 1600, 0.82);
      const res = await smartScan({ image_base64: base64, image_mime: mime });
      // Vision response içinde ingredients_list olmalı
      const inciList: string[] = res.vision_result?.ingredients_list || [];
      if (inciList.length === 0) {
        setError('Fotoğrafta INCI listesi okunamadı. Daha net bir etiket fotoğrafı dene veya elle yapıştır.');
        setPhotoBusy(false);
        return;
      }
      // Listeyi textarea'ya doldur
      setText(inciList.join(', '));
      setPhotoBusy(false);
      // Otomatik analiz et (kullanıcı yeniden butona basmasın)
      setTimeout(() => {
        const btn = document.querySelector<HTMLButtonElement>('[data-inci-analyze]');
        btn?.click();
      }, 100);
    } catch (err: any) {
      setError(err?.message || 'Foto işlenemedi');
      setPhotoBusy(false);
    }
  };

  // Prefill from query string (/tara -> Pionér rozet akışı)
  useEffect(() => {
    const prefill = searchParams.get('prefill');
    if (prefill && !text) {
      setText(prefill);
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);
    if (!text.trim()) {
      setError('Lütfen bir INCI listesi yapıştırın.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<AnalysisResponse>('/ingredients/analyze-list', { text });
      setResult(res);
    } catch (e) {
      setError('Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const useExample = () => {
    setText(EXAMPLE_INCI);
    setResult(null);
    setError(null);
  };

  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      <div className="mb-8">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Araç</span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-3">INCI ANALİZ</h1>
        <p className="text-on-surface-variant text-sm sm:text-base max-w-2xl leading-relaxed">
          Ürünün arkasındaki içerik listesini yapıştırın, REVELA her bileşeni atıflı bilim moat'ından geçirip
          güvenlik, kanıt seviyesi ve kategorik risk skorunu anında dönsün.
        </p>
      </div>

      {/* Foto okuma — etiketin fotoğrafını çek veya galeriden seç, AI Vision INCI'leri çıkarır */}
      <div className="curator-card p-5 mb-4 border-l-2 border-l-primary/40">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-on-surface mb-0.5 flex items-center gap-1.5">
              <span className="material-icon text-primary text-[18px]" aria-hidden="true">photo_camera</span>
              Etiketten Hızlı Oku
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Ürünün arkasındaki INCI listesinin fotoğrafını çek; AI Vision otomatik okuyup analiz etsin.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={photoBusy}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 border border-primary/40 text-primary rounded-sm hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              <span className="material-icon text-[14px]" aria-hidden="true">photo_camera</span>
              Foto Çek
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={photoBusy}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 border border-outline-variant/40 text-on-surface rounded-sm hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              <span className="material-icon text-[14px]" aria-hidden="true">photo_library</span>
              Galeriden
            </button>
          </div>
        </div>
        {photoBusy && (
          <p className="text-xs text-primary mt-3 flex items-center gap-1.5">
            <span className="material-icon text-[14px] animate-spin" aria-hidden="true">progress_activity</span>
            Foto işleniyor, Vision INCI'leri okuyor (5-12 sn)…
          </p>
        )}
      </div>

      {/* Input */}
      <div className="curator-card p-5 mb-8">
        <label className="label-caps text-outline mb-2 block tracking-wider">
          INCI Listesi (virgülle ayrılmış)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Tocopherol..."
          rows={6}
          className="w-full p-3 border border-outline-variant rounded-md bg-surface text-on-surface text-sm font-mono leading-relaxed focus:border-primary focus:outline-none"
        />
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            data-inci-analyze
            className="bg-primary text-on-primary px-5 py-2 rounded-md text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
          >
            {loading ? 'Analiz ediliyor…' : 'Analiz Et'}
          </button>
          <button
            onClick={useExample}
            className="text-primary text-sm hover:underline"
          >
            Örnek liste yükle
          </button>
          {text && (
            <button
              onClick={() => { setText(''); setResult(null); setError(null); }}
              className="text-outline text-sm hover:text-on-surface ml-auto"
            >
              Temizle
            </button>
          )}
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="curator-card p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="label-caps text-outline mb-1 tracking-wider">REVELA Skor</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-on-surface">{result.summary.score}</span>
                  <span className={`text-xs uppercase tracking-widest px-3 py-1 rounded-md ${verdictColor(result.summary.verdict)}`}>
                    {result.summary.verdict}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center text-xs">
                <div><div className="font-bold text-lg text-on-surface">{result.summary.total}</div><div className="text-outline">Bileşen</div></div>
                <div><div className="font-bold text-lg text-on-surface">{result.summary.matched}</div><div className="text-outline">Eşleşen</div></div>
                <div><div className="font-bold text-lg text-amber-600">{result.summary.allergens}</div><div className="text-outline">Alerjen</div></div>
                <div><div className="font-bold text-lg text-orange-600">{result.summary.fragrances}</div><div className="text-outline">Parfüm</div></div>
                <div><div className="font-bold text-lg text-red-600">{result.summary.kathon}</div><div className="text-outline">Kathon</div></div>
                <div><div className="font-bold text-lg text-red-700">{result.summary.cmr + result.summary.eu_banned}</div><div className="text-outline">CMR / Banned</div></div>
              </div>
            </div>
          </div>

          {/* Token cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.tokens.map((t) => (
              <div key={t.rank} className={`curator-card p-4 ${!t.matched ? 'border-l-4 border-outline-variant opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-outline mb-1">#{t.rank} · "{t.raw}"</p>
                    {t.matched && t.ingredient ? (
                      <Link
                        href={`/icerikler/${t.ingredient.ingredient_slug}`}
                        className="text-base font-semibold text-on-surface hover:text-primary block leading-tight truncate"
                      >
                        {t.ingredient.common_name || t.ingredient.inci_name}
                      </Link>
                    ) : (
                      <p className="text-base font-semibold text-outline">Eşleşmedi</p>
                    )}
                    {t.matched && t.ingredient?.function_summary && (
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{t.ingredient.function_summary}</p>
                    )}
                  </div>
                  {t.matched && t.ingredient?.evidence_grade && (
                    <span className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-md ${gradeColor(t.ingredient.evidence_grade)}`}>
                      {t.ingredient.evidence_grade}
                    </span>
                  )}
                </div>
                {t.matched && t.ingredient && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.ingredient.allergen_flag && (
                      <span className="label-caps text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">Alerjen</span>
                    )}
                    {t.ingredient.fragrance_flag && (
                      <span className="label-caps text-orange-700 bg-orange-50 px-2 py-0.5 rounded-sm">Parfüm</span>
                    )}
                    {t.ingredient.cmr_class && (
                      <span className="label-caps text-red-700 bg-red-50 px-2 py-0.5 rounded-sm">CMR {t.ingredient.cmr_class}</span>
                    )}
                    {t.ingredient.eu_banned && (
                      <span className="label-caps text-red-700 bg-red-100 px-2 py-0.5 rounded-sm">AB Yasak</span>
                    )}
                    {t.confidence != null && t.confidence < 0.7 && (
                      <span className="label-caps text-outline px-2 py-0.5 rounded-sm">~%{Math.round(t.confidence * 100)} eşleşme</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="curator-card p-5 bg-primary/5 text-center">
            <p className="text-sm text-on-surface-variant mb-3">
              Daha derin analiz? Cilt profilini gir, kişisel uyum skoru gör.
            </p>
            <Link
              href="/cilt-analizi"
              className="inline-block bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition"
            >
              Cilt Profilim →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
