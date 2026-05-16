'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CaptureGuard } from '@/components/skin-analysis/CaptureGuard';
import { RadarChart } from '@/components/skin-analysis/RadarChart';
import { PhotoConsentModal, CONSENT_VERSION } from '@/components/skin-analysis/PhotoConsentModal';
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

interface IngredientRec {
  ingredient: {
    ingredient_id: number;
    inci_name: string;
    common_name: string | null;
    ingredient_slug: string;
    evidence_grade: 'A' | 'B' | 'C' | 'D' | 'F' | null;
    function_summary: string | null;
    allergen_flag: boolean;
    fragrance_flag: boolean;
  } | null;
  display_name: string;
  products: Array<{
    product_id: number;
    product_slug: string;
    product_name: string;
    brand_name: string;
    image_url: string | null;
    price: number | null;
  }>;
}

interface AnalysisResult {
  scores: Record<string, number>;
  overall_score: number;
  recommendations: Record<string, IngredientRec[]>;
  model_version: string;
  analysis_id: number;
  created_at: string;
}

const EVIDENCE_GRADE_STYLE: Record<string, string> = {
  A: 'bg-green-100 text-green-700 border-green-200',
  B: 'bg-lime-100 text-lime-700 border-lime-200',
  C: 'bg-amber-100 text-amber-700 border-amber-200',
  D: 'bg-orange-100 text-orange-700 border-orange-200',
  F: 'bg-red-100 text-red-700 border-red-200',
};

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

type SubscribeState = 'idle' | 'submitting' | 'success' | 'error';

function EmailOptInWidget({ analysisId }: { analysisId: number }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubscribeState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setErrorMsg('Geçerli bir email adresi gir');
      setState('error');
      return;
    }
    setState('submitting');
    setErrorMsg('');
    try {
      await apiFetch(`/skin-analysis/${analysisId}/subscribe`, {
        method: 'POST',
        body: JSON.stringify({ email: trimmed }),
      });
      setState('success');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Kayıt başarısız, lütfen tekrar dene');
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="curator-card p-5 mb-8 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <span className="material-icon text-primary text-[24px] shrink-0" aria-hidden="true">mark_email_read</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-on-surface mb-1">Email'ine welcome bilgi gönderildi 🌿</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              28 gün sonra hatırlatma maili alacaksın — INCI önerilerinin etkisini görmek için yeni bir analiz çek.
              İstediğin zaman email içindeki linkten iptal edebilirsin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="curator-card p-5 mb-8 border-primary/30">
      <div className="flex items-start gap-3 mb-3">
        <span className="material-icon text-primary text-[24px] shrink-0" aria-hidden="true">notifications_active</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-on-surface mb-1">28 gün sonra cildini tekrar değerlendir</p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Email bırak, 28 gün sonra hatırlatma yollayalım — INCI önerilerinin etkisini görelim, trend grafiğin oluşsun.
            <strong className="block mt-1 text-on-surface">Spam yok, sadece bir hatırlatma. Tek tıkla iptal.</strong>
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
          placeholder="ornek@email.com"
          disabled={state === 'submitting'}
          className="flex-1 border border-outline-variant/40 rounded-sm px-3 py-2 text-sm bg-surface focus:border-primary focus:outline-none disabled:opacity-50"
          required
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="curator-btn-primary text-xs px-5 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state === 'submitting' ? 'Kaydediliyor…' : 'Hatırlatma İste'}
        </button>
      </form>
      {state === 'error' && (
        <p className="text-xs text-error mt-2 flex items-center gap-1">
          <span className="material-icon text-[14px]" aria-hidden="true">error_outline</span>
          {errorMsg}
        </p>
      )}
      <p className="text-[10px] text-outline mt-2 leading-relaxed">
        Email'in KVKK uyumlu saklanır — opt-out anında <strong>silinir</strong>, sadece SHA-256 hash kalır.
      </p>
    </div>
  );
}

export default function FotoTestPage() {
  const [phase, setPhase] = useState<'idle' | 'consent' | 'camera' | 'uploading' | 'result' | 'error'>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedScore, setUploadedScore] = useState<number | null>(null);
  // KVKK açık rıza versiyonu — backend doğrular, eksikse 400
  const [consentVersion, setConsentVersion] = useState<string>('');

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
          consent_version: consentVersion || CONSENT_VERSION,
        }),
      });
      setResult(res);
      setPhase('result');
    } catch (err: any) {
      setError(err.message || 'Bilinmeyen hata');
      setPhase('error');
    }
  };

  const handleConsentAccept = (version: string) => {
    setConsentVersion(version);
    setPhase('camera');
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setUploadedScore(null);
    setConsentVersion('');
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
          <button onClick={() => setPhase('consent')} className="curator-btn-primary text-sm px-8 py-3">
            Kamera Aç
          </button>
          <p className="text-[10px] text-outline mt-3">
            Devam etmeden önce KVKK aydınlatma metnini okuyup açık rıza verirsin.
          </p>
        </div>
      )}

      {phase === 'camera' && (
        <CaptureGuard onCapture={handleCapture} onCancel={reset} />
      )}

      <PhotoConsentModal
        open={phase === 'consent'}
        onAccept={handleConsentAccept}
        onDecline={reset}
      />

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

          {/* 6-Boyut radar chart + breakdown bar */}
          <div className="curator-card p-5 mb-8">
            <h3 className="text-base font-semibold text-on-surface mb-4 text-center">6-Boyut Cilt Skoru</h3>

            <RadarChart
              dimensions={[
                { key: 't_zone_oil', label: 'T-Bölge', value: Number(result.scores.t_zone_oil) || 0 },
                { key: 'pore_visibility', label: 'Gözenek', value: Number(result.scores.pore_visibility) || 0 },
                { key: 'wrinkles', label: 'Kırışıklık', value: Number(result.scores.wrinkles) || 0 },
                { key: 'pigmentation', label: 'Leke', value: Number(result.scores.pigmentation) || 0 },
                { key: 'redness', label: 'Kızarıklık', value: Number(result.scores.redness) || 0 },
                { key: 'under_eye_darkness', label: 'Gözaltı', value: Number(result.scores.under_eye_darkness) || 0 },
              ]}
              size={320}
            />

            {/* Bonus: acne + fitzpatrick (radar dışı, ayrı bilgi kartı) */}
            {(result.scores.acne_count != null || result.scores.fitzpatrick_type != null) && (
              <div className="mt-6 pt-4 border-t border-outline-variant/20 grid grid-cols-2 gap-4 text-center text-sm">
                {result.scores.acne_count != null && (
                  <div>
                    <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">Aktif Sivilce</p>
                    <p className="text-2xl font-bold text-on-surface">{result.scores.acne_count}</p>
                  </div>
                )}
                {result.scores.fitzpatrick_type != null && (
                  <div>
                    <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">Cilt Tonu</p>
                    <p className="text-2xl font-bold text-on-surface">Tip {result.scores.fitzpatrick_type}</p>
                    <p className="text-xs text-on-surface-variant mt-1">Fitzpatrick I-VI</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INCI Recommendations + REVELA ürün widget (Day 8) */}
          {Object.keys(result.recommendations).length > 0 && (
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-on-surface mb-1">Önerilen Aktif Bileşenler</h3>
                <p className="text-xs text-on-surface-variant">
                  Skoru ≥40 olan boyutlar için seçilen INCI'ler ve REVELA katalogundaki ürünler.
                </p>
              </div>
              <div className="space-y-6">
                {Object.entries(result.recommendations).map(([dim, items]) => (
                  <section key={dim} className="curator-card p-5">
                    <h4 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
                      <span className="material-icon text-primary text-[18px]" aria-hidden="true">target</span>
                      {DIMENSION_LABELS[dim] || dim} için
                    </h4>
                    <div className="space-y-4">
                      {items.map((it, idx) => (
                        <article
                          key={(it.ingredient?.ingredient_id ?? `static-${idx}`) + dim}
                          className="border border-outline-variant/30 rounded-sm p-4 bg-surface-container-lowest"
                        >
                          {/* INCI başlık satırı: isim + evidence grade + uyarılar */}
                          <header className="flex items-start gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              {it.ingredient?.ingredient_slug ? (
                                <Link
                                  href={`/icerikler/${it.ingredient.ingredient_slug}`}
                                  className="text-sm font-bold text-on-surface hover:text-primary transition-colors block truncate"
                                >
                                  {it.display_name}
                                </Link>
                              ) : (
                                <span className="text-sm font-bold text-on-surface block truncate">
                                  {it.display_name}
                                </span>
                              )}
                              {it.ingredient?.inci_name && it.ingredient.common_name && it.ingredient.common_name !== it.ingredient.inci_name && (
                                <span className="text-[10px] text-outline italic block">
                                  INCI: {it.ingredient.inci_name}
                                </span>
                              )}
                            </div>
                            {it.ingredient?.evidence_grade && (
                              <span
                                className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded border ${
                                  EVIDENCE_GRADE_STYLE[it.ingredient.evidence_grade] || ''
                                }`}
                                title="Kanıt skoru (A=güçlü, F=zayıf)"
                              >
                                {it.ingredient.evidence_grade}
                              </span>
                            )}
                          </header>

                          {/* Fonksiyon açıklaması */}
                          {it.ingredient?.function_summary && (
                            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                              {it.ingredient.function_summary}
                            </p>
                          )}

                          {/* Uyarı rozetleri */}
                          {(it.ingredient?.allergen_flag || it.ingredient?.fragrance_flag) && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {it.ingredient.allergen_flag && (
                                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Alerjen
                                </span>
                              )}
                              {it.ingredient.fragrance_flag && (
                                <span className="text-[10px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                                  Parfüm
                                </span>
                              )}
                            </div>
                          )}

                          {/* REVELA ürün widget */}
                          {it.products.length > 0 ? (
                            <div className="border-t border-outline-variant/20 pt-3 mt-1">
                              <p className="text-[10px] uppercase tracking-wider text-outline mb-2 font-semibold">
                                Bu INCI'yi içeren REVELA ürünleri
                              </p>
                              <div className="space-y-2">
                                {it.products.map((p) => (
                                  <Link
                                    key={p.product_id}
                                    href={`/urunler/${p.product_slug}`}
                                    className="group flex items-center gap-3 p-2 rounded-sm hover:bg-surface-container-low transition-colors"
                                  >
                                    <div className="w-12 h-12 bg-surface-container rounded-sm overflow-hidden shrink-0 relative">
                                      {p.image_url && !p.image_url.includes('placehold.co') && !p.image_url.includes('dicebear') ? (
                                        <Image
                                          src={p.image_url}
                                          alt={p.product_name}
                                          fill
                                          sizes="48px"
                                          className="object-contain"
                                        />
                                      ) : (
                                        <span className="material-icon text-outline-variant flex items-center justify-center h-full text-[18px]" aria-hidden="true">
                                          inventory_2
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] text-outline uppercase tracking-wider truncate">
                                        {p.brand_name}
                                      </p>
                                      <p className="text-xs font-medium text-on-surface truncate group-hover:text-primary transition-colors">
                                        {p.product_name}
                                      </p>
                                    </div>
                                    {p.price != null && (
                                      <span className="text-[11px] font-semibold text-on-surface shrink-0">
                                        ₺{p.price.toFixed(0)}
                                      </span>
                                    )}
                                    <span
                                      className="material-icon text-outline-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                                      style={{ fontSize: '14px' }}
                                      aria-hidden="true"
                                    >
                                      arrow_forward
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="border-t border-outline-variant/20 pt-3 mt-1">
                              <Link
                                href={`/urunler?search=${encodeURIComponent(it.display_name)}`}
                                className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                              >
                                Bu INCI'yi içeren ürünleri ara
                                <span className="material-icon text-[12px]" aria-hidden="true">arrow_forward</span>
                              </Link>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}

          {/* Email opt-in widget (Faz 1 Gün 9) */}
          <EmailOptInWidget analysisId={result.analysis_id} />

          {/* Disclaimer + actions */}
          <p className="text-xs text-on-surface-variant italic text-center mb-6">
            ⚠️ Bu analiz tıbbi tanı değildir. Cilt sorunlarınız için lütfen dermatologa başvurun.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={reset} className="curator-btn-primary text-sm px-6 py-3">
              Yeni Analiz
            </button>
            <Link
              href={`/cilt-analizi/karsilastir?to=${result.analysis_id}`}
              className="text-sm text-on-surface border border-primary/40 bg-primary/5 rounded-sm px-6 py-3 hover:bg-primary/10 transition-colors text-center inline-flex items-center justify-center gap-1.5"
            >
              <span className="material-icon material-icon-sm" aria-hidden="true">compare_arrows</span>
              Eski Analizimle Karşılaştır
            </Link>
            <Link href="/cilt-analizi" className="text-sm text-on-surface-variant border border-outline-variant/30 rounded-sm px-6 py-3 hover:bg-surface-container-low transition-colors text-center">
              Quiz'e Dön
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
