'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CaptureGuard } from '@/components/skin-analysis/CaptureGuard';
import { apiFetch } from '@/lib/api';

/**
 * Foto Analiz Faz 1 demo sayfası — MediaPipe çekim guard + skin-analysis API e2e test.
 *
 * 2026-05-16 Gün 4 ile eklendi. Geçici dev/test sayfası — Gün 5-7'de
 * /cilt-analizi sayfasına entegre edilecek.
 *
 * Akış:
 * 1. CaptureGuard mount → kamera + face mesh + kalite skoru
 * 2. Foto onaylanırsa → /api/v1/skin-analysis POST
 * 3. 6-boyut skor + INCI öneri render
 */

interface AnalysisResult {
  scores: Record<string, number>;
  overall_score: number;
  recommendations: Record<string, string[]>;
  model_version: string;
  analysis_id: number;
  created_at: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  t_zone_oil: 'T-Bölge Parlama',
  pore_visibility: 'Gözenek Görünürlüğü',
  wrinkles: 'Kırışıklık',
  pigmentation: 'Leke / Pigmentasyon',
  redness: 'Kızarıklık',
  under_eye_darkness: 'Gözaltı Moru',
  acne_count: 'Aktif Sivilce Sayısı',
  fitzpatrick_type: 'Cilt Tonu (Fitzpatrick)',
};

export default function FotoTestPage() {
  const [phase, setPhase] = useState<'idle' | 'camera' | 'uploading' | 'result' | 'error'>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedScore, setUploadedScore] = useState<number | null>(null);

  const handleCapture = async (data: { base64: string; mime: string; guard_score: number }) => {
    setUploadedScore(data.guard_score);
    setPhase('uploading');
    setError(null);
    try {
      const res = await apiFetch<AnalysisResult>('/skin-analysis', {
        method: 'POST',
        body: JSON.stringify({
          image_base64: data.base64,
          image_mime: data.mime,
          guard_score: data.guard_score,
        }),
      });
      setResult(res);
      setPhase('result');
    } catch (err: any) {
      setError(err.message || 'Bilinmeyen hata');
      setPhase('error');
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setUploadedScore(null);
    setPhase('idle');
  };

  return (
    <div className="curator-section max-w-3xl mx-auto px-4 py-8">
      <nav className="text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary">Ana Sayfa</Link>
        <span className="mx-2 text-outline">/</span>
        <Link href="/cilt-analizi" className="hover:text-primary">Cilt Analizi</Link>
        <span className="mx-2 text-outline">/</span>
        <span className="text-on-surface">Foto Test (Beta)</span>
      </nav>

      {phase === 'idle' && (
        <div className="text-center py-12">
          <div className="inline-block mb-4">
            <span className="material-icon text-6xl text-primary" aria-hidden="true">photo_camera</span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface mb-3">Foto ile Cilt Analizi</h1>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto mb-2">
            Yüzünüzün fotoğrafını çekin, AI 6 boyutlu cilt skorunu çıkarsın:
          </p>
          <ul className="text-xs text-on-surface-variant max-w-sm mx-auto mb-8 space-y-1">
            <li>• T-bölge parlama + gözenek görünürlüğü</li>
            <li>• Kırışıklık + leke (pigmentasyon)</li>
            <li>• Kızarıklık + gözaltı moru</li>
            <li>• Aktif sivilce sayısı + cilt tonu</li>
          </ul>
          <p className="text-xs text-on-surface-variant/70 max-w-sm mx-auto mb-6">
            Foto cihazınızdan çıkmaz — sadece skor değerleri kaydedilir.
          </p>
          <button onClick={() => setPhase('camera')} className="curator-btn-primary text-sm px-8 py-3">
            Kamera Aç
          </button>
        </div>
      )}

      {phase === 'camera' && (
        <CaptureGuard onCapture={handleCapture} onCancel={reset} />
      )}

      {phase === 'uploading' && (
        <div className="text-center py-16">
          <div className="inline-block mb-4 animate-pulse">
            <span className="material-icon text-5xl text-primary" aria-hidden="true">cloud_upload</span>
          </div>
          <p className="text-on-surface font-semibold mb-2">Analiz ediliyor…</p>
          <p className="text-xs text-on-surface-variant">Foto kalitesi: {uploadedScore}/100 — Gemini Vision çalışıyor (5-12 sn)</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="text-center py-12">
          <div className="inline-block mb-4">
            <span className="material-icon text-5xl text-error" aria-hidden="true">error</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-3">Analiz başarısız</h2>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto mb-6">{error}</p>
          <button onClick={reset} className="curator-btn-primary text-sm px-6 py-3">
            Tekrar Dene
          </button>
        </div>
      )}

      {phase === 'result' && result && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-on-surface mb-2">Cilt Analizi Sonucu</h2>
            <p className="text-on-surface-variant text-sm">Analiz ID: {result.analysis_id} · Model: {result.model_version}</p>
          </div>

          {/* Overall + Guard Score */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="curator-card p-5 text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Genel Skor</p>
              <p className="text-5xl font-bold text-primary">{result.overall_score}</p>
              <p className="text-xs text-on-surface-variant mt-2">0-100 (yüksek = daha şiddetli)</p>
            </div>
            <div className="curator-card p-5 text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Foto Kalitesi</p>
              <p className="text-5xl font-bold text-on-surface">{uploadedScore ?? '-'}</p>
              <p className="text-xs text-on-surface-variant mt-2">MediaPipe çekim guard</p>
            </div>
          </div>

          {/* 6-Boyut breakdown */}
          <div className="curator-card p-5 mb-8">
            <h3 className="text-base font-semibold text-on-surface mb-4">Boyut Bazında Skor</h3>
            <div className="space-y-3">
              {Object.entries(result.scores).map(([dim, score]) => (
                <div key={dim}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-on-surface">{DIMENSION_LABELS[dim] || dim}</span>
                    <span className="font-semibold text-on-surface">{score}</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        score >= 70 ? 'bg-score-low' : score >= 40 ? 'bg-score-medium' : 'bg-score-high'
                      }`}
                      style={{ width: `${Math.min(100, Number(score) * (dim === 'fitzpatrick_type' ? 16.67 : dim === 'acne_count' ? 2 : 1))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INCI Recommendations */}
          {Object.keys(result.recommendations).length > 0 && (
            <div className="curator-card p-5 mb-8">
              <h3 className="text-base font-semibold text-on-surface mb-4">Önerilen Aktif Bileşenler (skor ≥40)</h3>
              <div className="space-y-4">
                {Object.entries(result.recommendations).map(([dim, inciList]) => (
                  <div key={dim}>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                      {DIMENSION_LABELS[dim] || dim} için
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {inciList.map((inci) => (
                        <Link
                          key={inci}
                          href={`/icerikler?q=${encodeURIComponent(inci)}`}
                          className="px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-xs text-primary hover:bg-primary/10 transition-colors"
                        >
                          {inci}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer + actions */}
          <p className="text-xs text-on-surface-variant italic text-center mb-6">
            ⚠️ Bu analiz tıbbi tanı değildir. Cilt sorunlarınız için lütfen dermatologa başvurun.
          </p>

          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="curator-btn-primary text-sm px-6 py-3">
              Yeni Analiz
            </button>
            <Link href="/cilt-analizi" className="text-sm text-on-surface-variant border border-outline-variant/30 rounded-sm px-6 py-3 hover:bg-surface-container-low transition-colors">
              Quiz'e Dön
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
