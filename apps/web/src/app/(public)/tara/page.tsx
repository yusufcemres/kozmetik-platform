'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { detectBarcodeFromVideo, captureVideoFrame, blobToBase64, fileToResizedBase64, detectBarcodeFromBlob } from '@/lib/barcode';
import { smartScan, ScanResponse } from '@/lib/smart-scan';
import { ApiError } from '@/lib/api';

type Phase = 'idle' | 'permission' | 'scanning' | 'processing' | 'result' | 'error' | 'batch';

interface BatchProgress {
  total: number;
  current: number;
  results: Array<{ filename: string; status: 'ok' | 'fail'; product_slug?: string; product_name?: string; brand_name?: string; barcode?: string; error?: string }>;
}

// Tek INCI kartı — varsayılan kapalı, tıklayınca detay açılır
function InciCard({ token: t }: { token: any }) {
  const [open, setOpen] = useState(false);
  const gradeColor = !t.ingredient?.evidence_grade ? 'bg-surface-container text-outline' :
    t.ingredient.evidence_grade === 'A' ? 'bg-green-100 text-green-700' :
    t.ingredient.evidence_grade === 'B' ? 'bg-lime-100 text-lime-700' :
    t.ingredient.evidence_grade === 'C' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700';
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className={`text-left border border-outline-variant/20 rounded p-2 text-xs hover:border-primary/40 transition-colors ${!t.matched ? 'opacity-60 bg-surface-container-low' : 'bg-surface'} ${open ? 'border-primary/60 shadow-sm' : ''}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-outline w-5 flex-shrink-0">#{t.rank}</span>
        <span className="flex-1 min-w-0 truncate">
          {t.matched && t.ingredient ? (
            <span className="font-semibold text-on-surface">{t.ingredient.common_name || t.ingredient.inci_name}</span>
          ) : (
            <span className="text-on-surface-variant">"{t.raw}" — eşleşmedi</span>
          )}
        </span>
        {t.matched && t.ingredient?.evidence_grade && (
          <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded ${gradeColor}`}>{t.ingredient.evidence_grade}</span>
        )}
        <span className="material-icon text-outline text-[16px] flex-shrink-0" aria-hidden="true">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </div>
      {open && t.matched && t.ingredient && (
        <div className="mt-2 pt-2 border-t border-outline-variant/20 space-y-1.5">
          {t.ingredient.function_summary && (
            <p className="text-[11px] text-on-surface-variant leading-snug">{t.ingredient.function_summary}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {t.ingredient.allergen_flag && <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Alerjen</span>}
            {t.ingredient.fragrance_flag && <span className="text-[9px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">Parfüm</span>}
            {t.ingredient.cmr_class && <span className="text-[9px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded">CMR</span>}
            {t.ingredient.eu_banned && <span className="text-[9px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded">AB Yasak</span>}
          </div>
          {t.ingredient.ingredient_slug && (
            <Link
              href={`/icerikler/${t.ingredient.ingredient_slug}`}
              className="block text-[11px] text-primary hover:underline mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              Tam bilim makalesi →
            </Link>
          )}
        </div>
      )}
    </button>
  );
}

export default function TaraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>('idle');

  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [hint, setHint] = useState('Ürünü çerçeveye hizala');

  // Phase ref senkronizasyonu — async closure'larda doğru değer için
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const stopCamera = useCallback(() => {
    if (scanLoopRef.current !== null) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const loopBarcode = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    let attempts = 0;

    const tick = async () => {
      // phaseRef ile gerçek-zamanlı phase kontrolü
      if (!streamRef.current || phaseRef.current === 'processing' || phaseRef.current === 'result') return;
      attempts++;
      try {
        const found = await detectBarcodeFromVideo(video);
        if (found) {
          await handleDetected({ barcode: found.rawValue });
          return;
        }
      } catch {
        // sessizce yoksay (bazı frame'lerde detector hata verebilir)
      }

      if (attempts === 20) {
        setHint('Barkod yoksa "Çek" butonu ile ürünü fotoğrafla');
      }
      scanLoopRef.current = requestAnimationFrame(tick);
    };
    scanLoopRef.current = requestAnimationFrame(tick);
  }, []);

  const startCamera = async () => {
    setError('');
    setResult(null);
    // ÖNEMLİ: phase'i 'scanning' yap → video element render olur → videoRef.current dolar
    // Eskiden 'permission' state video element'i render etmiyordu → ref NULL → kamera bağlanamıyordu
    setPhase('scanning');
    setHint('Kamera açılıyor…');

    // React render'ın commit olmasını bekle (mobile Safari için kritik)
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    let stream: MediaStream;
    try {
      // HTTPS kontrolü (yerel dev'de http://localhost OK)
      const isSecure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      if (!isSecure) {
        throw new Error('Kamera erişimi için HTTPS gerekli. https:// üzerinden tekrar dene.');
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Tarayıcın kamera erişimini desteklemiyor. Chrome veya Safari güncel sürümünü dene.');
      }

      try {
        // Önce arka kamera (mobilde ürün taraması için)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (envErr: any) {
        // Arka kamera yoksa (laptop, tablet ön kameralı) → ön kameraya düş
        if (envErr.name === 'OverconstrainedError' || envErr.name === 'NotFoundError') {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } else {
          throw envErr;
        }
      }
    } catch (err: any) {
      setPhase('error');
      // Kullanıcı dostu mesajlar
      const name = err.name || '';
      let msg = err.message || 'Kamera erişimi reddedildi.';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        msg = 'Kamera izni reddedildi. Tarayıcı ayarlarından bu siteye kamera izni vermen gerekiyor.';
      } else if (name === 'NotFoundError') {
        msg = 'Cihazında kullanılabilir kamera bulunamadı.';
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        msg = 'Kamera başka bir uygulama tarafından kullanılıyor olabilir. Diğer uygulamaları kapat ve tekrar dene.';
      }
      setError(msg);
      return;
    }

    streamRef.current = stream;

    // Video element'i bağla — bu noktada phase 'scanning' olduğu için DOM'da var
    if (!videoRef.current) {
      // Aşırı nadir: render commit edilmemiş. Bir kere daha bekle.
      await new Promise((r) => requestAnimationFrame(r));
    }

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      try {
        // iOS Safari: play() user gesture içinde olmalı (bu zaten button click'inden geldi)
        await videoRef.current.play();
      } catch (playErr: any) {
        // iOS bazen autoplay reject eder — track'leri durdurma, kullanıcıya bildir
        console.warn('video.play() failed:', playErr);
        // Çoğu zaman zaten oynuyor, sadece promise reject ediyor — devam
      }
    } else {
      // Hala null — beklenmeyen durum
      stopCamera();
      setPhase('error');
      setError('Video element başlatılamadı. Sayfayı yenileyip tekrar dene.');
      return;
    }

    setHint('Ürünü çerçeveye hizala — otomatik taranır');
    loopBarcode();
  };

  const handleDetected = async (body: { barcode?: string; image_base64?: string; image_mime?: string }) => {
    setPhase('processing');
    setHint('Eşleştiriliyor…');
    stopCamera();
    try {
      const res = await smartScan(body);
      setResult(res);
      setPhase('result');

      if (res.status === 'matched' && res.confidence >= 0.8) {
        setTimeout(() => router.push(`/urunler/${res.product!.product_slug}?scan=1`), 1400);
      }
    } catch (err: any) {
      setPhase('error');
      // 503 → AI provider'lar (Gemini + Claude) ulaşılamıyor; "Ürün bulunamadı"
      // yerine net mesaj göster, kullanıcı yanlış yere bakmasın.
      if (err instanceof ApiError && err.status === 503) {
        setError('AI görsel tanıma servisi şu an yanıt vermiyor. Birkaç dakika sonra tekrar dene veya katalogda manuel ara.');
      } else {
        setError(err.message || 'Tarama başarısız');
      }
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const blob = await captureVideoFrame(videoRef.current);
    if (!blob) return;
    const base64 = await blobToBase64(blob);
    await handleDetected({ image_base64: base64, image_mime: 'image/jpeg' });
  };

  const reset = () => {
    setResult(null);
    setError('');
    setPhase('idle');
    setBatchProgress(null);
  };

  // === Foto upload (galeri tek dosya) ===
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset
    setPhase('processing');
    setHint('Foto islenıyor...');
    setError('');
    try {
      // Once barkod tara (yerel, ucuz)
      const barcode = await detectBarcodeFromBlob(file);
      if (barcode?.rawValue) {
        await handleDetected({ barcode: barcode.rawValue });
        return;
      }
      // Barkod yoksa vision'a gonder (resize)
      const { base64, mime } = await fileToResizedBase64(file, 1600, 0.82);
      await handleDetected({ image_base64: base64, image_mime: mime });
    } catch (err: any) {
      setPhase('error');
      if (err instanceof ApiError && err.status === 503) {
        setError('AI görsel tanıma servisi şu an yanıt vermiyor. Birkaç dakika sonra tekrar dene veya katalogda manuel ara.');
      } else {
        setError(err.message || 'Foto islenemedi');
      }
    }
  };

  // === Batch upload (coklu dosya) ===
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = ''; // reset
    setPhase('batch');
    setError('');
    setBatchProgress({ total: files.length, current: 0, results: [] });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Barkod tara
        const barcode = await detectBarcodeFromBlob(file);
        let res: ScanResponse;
        if (barcode?.rawValue) {
          res = await smartScan({ barcode: barcode.rawValue });
        } else {
          const { base64, mime } = await fileToResizedBase64(file, 1600, 0.82);
          res = await smartScan({ image_base64: base64, image_mime: mime });
        }
        const status: 'ok' | 'fail' = res.status === 'matched' || res.status === 'candidates' ? 'ok' : 'fail';
        setBatchProgress((prev) => prev ? {
          ...prev,
          current: i + 1,
          results: [...prev.results, {
            filename: file.name,
            status,
            product_slug: res.product?.product_slug,
            product_name: res.product?.product_name || res.vision_result?.product_name || undefined,
            brand_name: res.product?.brand_name || res.vision_result?.brand || undefined,
            barcode: barcode?.rawValue,
          }],
        } : prev);
      } catch (err: any) {
        setBatchProgress((prev) => prev ? {
          ...prev,
          current: i + 1,
          results: [...prev.results, { filename: file.name, status: 'fail', error: err.message }],
        } : prev);
      }
    }
  };

  // Video container sadece scanning'de görünür. Processing'de kamera durdugu icin
  // siyah ekran yerine 'veri isleniyor' efekti gosteririz.
  const showVideo = phase === 'scanning';

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface mb-2">
            Akıllı Tarama
          </h1>
          <p className="text-sm text-on-surface-variant">
            Barkod, etiket veya ürünün kendisini kameraya göster
          </p>
        </div>

        {/* Idle state */}
        {phase === 'idle' && (
          <div className="curator-card p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="material-icon text-primary text-[40px]" aria-hidden="true">qr_code_scanner</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface mb-2">Başlamaya hazır mısın?</h2>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                Kamera izni verdiğinde üç şekilde tanıyabiliriz:
              </p>
            </div>

            <div className="space-y-3 text-left max-w-sm mx-auto">
              <div className="flex items-start gap-3">
                <span className="material-icon text-primary text-[20px] mt-0.5" aria-hidden="true">qr_code_2</span>
                <div>
                  <div className="text-sm font-semibold text-on-surface">Barkod (en hızlı)</div>
                  <div className="text-xs text-on-surface-variant">EAN, UPC — 1-2 saniyede eşleşir</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-icon text-primary text-[20px] mt-0.5" aria-hidden="true">smart_toy</span>
                <div>
                  <div className="text-sm font-semibold text-on-surface">Görsel (AI)</div>
                  <div className="text-xs text-on-surface-variant">Ambalajı fotoğrafla — marka + ürün tanınır</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-icon text-primary text-[20px] mt-0.5" aria-hidden="true">list_alt</span>
                <div>
                  <div className="text-sm font-semibold text-on-surface">Etiket okuma</div>
                  <div className="text-xs text-on-surface-variant">İçerik listesini oku → eşle</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-stretch justify-center max-w-md mx-auto pt-2">
              <button
                onClick={startCamera}
                className="curator-btn-primary text-sm px-6 py-3 flex-1"
                type="button"
              >
                <span className="material-icon material-icon-sm mr-2" aria-hidden="true">photo_camera</span>
                Kamerayı Aç
              </button>
              <label className="cursor-pointer flex-1 inline-flex items-center justify-center text-sm px-6 py-3 border border-outline-variant/40 rounded-sm bg-surface hover:bg-surface-container-low transition-colors">
                <span className="material-icon material-icon-sm mr-2" aria-hidden="true">photo_library</span>
                Galeriden Sec
                <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <label className="block cursor-pointer text-xs text-primary hover:underline pt-1">
              <span className="material-icon align-middle text-[14px] mr-1" aria-hidden="true">cloud_upload</span>
              Toplu yukle (cok foto, batch tarama)
              <input type="file" accept="image/*" multiple onChange={handleBatchUpload} className="hidden" />
            </label>
            <p className="text-[10px] text-outline">
              Kamera izni isteyeceğiz veya galeriden seç. Toplu yüklemede her foto otomatik taranır.
            </p>
          </div>
        )}

        {/* Processing — tek foto OCR scan efekti */}
        {phase === 'processing' && (
          <div className="curator-card p-8 text-center space-y-5">
            <div className="relative w-40 h-40 mx-auto rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-primary/15 overflow-hidden">
              {/* Pulsing icon */}
              <span className="material-icon absolute inset-0 flex items-center justify-center text-primary text-[72px] opacity-70 process-pulse" aria-hidden="true">document_scanner</span>
              {/* Scan sweep line */}
              <div className="scan-line" />
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/60" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/60" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/60" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/60" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-on-surface">Veriler işleniyor</p>
              <div className="flex items-center justify-center gap-1 text-xs text-on-surface-variant">
                <span className="dot-anim" style={{ animationDelay: '0ms' }}>•</span>
                <span>Barkod</span>
                <span className="text-outline">·</span>
                <span className="dot-anim" style={{ animationDelay: '200ms' }}>•</span>
                <span>Marka</span>
                <span className="text-outline">·</span>
                <span className="dot-anim" style={{ animationDelay: '400ms' }}>•</span>
                <span>INCI listesi</span>
                <span className="text-outline">·</span>
                <span className="dot-anim" style={{ animationDelay: '600ms' }}>•</span>
                <span>Skor</span>
              </div>
              <p className="text-[10px] text-outline">REVELA AI etiketi analiz ediyor…</p>
            </div>
          </div>
        )}

        {/* Batch upload progress */}
        {phase === 'batch' && batchProgress && (
          <div className="curator-card p-5 space-y-4">
            <div className="text-center">
              {batchProgress.current < batchProgress.total && (
                <div className="relative w-24 h-24 mx-auto rounded-lg bg-gradient-to-br from-primary/5 to-primary/15 overflow-hidden mb-3">
                  <span className="material-icon absolute inset-0 flex items-center justify-center text-primary text-[40px] opacity-60" aria-hidden="true">photo_library</span>
                  <div className="scan-line" />
                </div>
              )}
              <h2 className="text-lg font-bold text-on-surface mb-1">Toplu Tarama</h2>
              <p className="text-xs text-on-surface-variant">{batchProgress.current} / {batchProgress.total} foto işlendi</p>
              <div className="w-full bg-surface-container-low rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {batchProgress.results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs border-b border-outline-variant/10 pb-1">
                  <span className="material-icon text-[14px]" style={{ color: r.status === 'ok' ? '#10b981' : '#ef4444' }} aria-hidden="true">
                    {r.status === 'ok' ? 'check_circle' : 'error'}
                  </span>
                  <span className="text-outline text-[10px] flex-shrink-0">{r.filename.slice(-25)}</span>
                  <span className="text-on-surface truncate flex-1">
                    {r.product_slug ? (
                      <Link href={`/urunler/${r.product_slug}`} className="hover:underline text-primary">
                        {r.brand_name} / {r.product_name}
                      </Link>
                    ) : (
                      <span className="text-on-surface-variant">{r.product_name || r.brand_name || r.error || 'eşleşmedi'}</span>
                    )}
                  </span>
                  {r.barcode && <span className="text-[9px] text-outline font-mono">{r.barcode}</span>}
                </div>
              ))}
            </div>
            {batchProgress.current === batchProgress.total && (
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <span className="text-xs text-on-surface-variant">
                  ✓ {batchProgress.results.filter(r => r.status === 'ok').length} eşleşti · {batchProgress.results.filter(r => r.status === 'fail').length} bulunamadı
                </span>
                <button
                  onClick={reset}
                  className="text-xs text-primary hover:underline"
                >
                  Yeni Tarama
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scanning / processing — video container always rendered when active */}
        {showVideo && (
          <div className="space-y-4">
            <div className="relative aspect-[3/4] sm:aspect-video bg-black rounded-sm overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              {/* Scan frame overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-white/70 rounded-sm">
                  <div className="absolute -top-px -left-px w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-sm" />
                  <div className="absolute -top-px -right-px w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-sm" />
                  <div className="absolute -bottom-px -left-px w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-sm" />
                  <div className="absolute -bottom-px -right-px w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-sm" />
                </div>
              </div>
              {/* Bottom hint */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur text-white text-xs rounded-sm px-4 py-2 text-center">
                {hint}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { stopCamera(); reset(); }}
                className="px-5 py-3 text-sm text-on-surface-variant border border-outline-variant/30 rounded-sm hover:bg-surface-container-low transition-colors"
                type="button"
              >
                İptal
              </button>
              <button
                onClick={capturePhoto}
                className="curator-btn-primary text-sm px-6 py-3 disabled:opacity-50"
                type="button"
              >
                <span className="material-icon material-icon-sm mr-2" aria-hidden="true">photo_camera</span>
                Çek
              </button>
            </div>
          </div>
        )}

        {/* Result state */}
        {phase === 'result' && result && (
          <div className="space-y-4">
            {result.status === 'matched' && result.product && (
              <div className="curator-card p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="material-icon text-primary text-[32px]" aria-hidden="true">check_circle</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-outline mb-1">
                    {result.method === 'barcode' ? 'Barkod eşleşti' : `Görsel tanındı · %${Math.round(result.confidence * 100)}`}
                  </div>
                  <div className="text-xs text-on-surface-variant">{result.product.brand_name}</div>
                  <h2 className="text-lg font-bold text-on-surface mt-1">{result.product.product_name}</h2>
                </div>

                {/* Enrichment: yeni INCI onerildi (pending_review) */}
                {result.enriched_inci_count != null && result.enriched_inci_count > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                    <span className="material-icon align-middle text-[18px] mr-1" aria-hidden="true">pending</span>
                    Tebrikler! <strong>{result.enriched_inci_count} INCI önerin</strong> admin onayına gönderildi — Pionér katkı 🏆
                    <p className="text-[11px] mt-1 opacity-80">Onaylandığında ürün sayfasında görünecek.</p>
                  </div>
                )}
                {result.enriched_inci_count === 0 && result.inci_analysis && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-700">
                    Fotoğraftan {result.inci_analysis.summary.matched} INCI okundu — hepsi zaten kayıtlıydı.
                  </div>
                )}

                <Link
                  href={`/urunler/${result.product.product_slug}?scan=1`}
                  className="curator-btn-primary text-sm px-6 py-3 inline-flex items-center"
                >
                  Tam Bilgiyi Gör
                  <span className="material-icon material-icon-sm ml-2" aria-hidden="true">arrow_forward</span>
                </Link>
              </div>
            )}

            {/* INCI-only mode: urun tanınamadı ama INCI listesi okundu */}
            {result.status === 'inci_only' && result.inci_analysis && (
              <div className="curator-card p-5 space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 mb-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                    <span className="material-icon text-[14px]">science</span>
                    INCI Analizi
                  </div>
                  <h2 className="text-lg font-bold text-on-surface mb-1">
                    Ürün tanınamadı ama içeriği okuduk
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    {result.inci_analysis.summary.matched} / {result.inci_analysis.summary.total} bileşen REVELA veritabanında eşleşti
                  </p>
                  <div className="flex items-baseline justify-center gap-2 mt-3">
                    <span className="text-3xl font-bold text-on-surface">{result.inci_analysis.summary.score}</span>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${
                      result.inci_analysis.summary.verdict === 'çok iyi' ? 'bg-green-600 text-white' :
                      result.inci_analysis.summary.verdict === 'iyi' ? 'bg-lime-600 text-white' :
                      result.inci_analysis.summary.verdict === 'orta' ? 'bg-amber-500 text-white' :
                      result.inci_analysis.summary.verdict === 'riskli' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'
                    }`}>{result.inci_analysis.summary.verdict}</span>
                  </div>
                </div>
                <div className="text-[10px] text-outline text-center">Detay görmek için kartlara tıkla</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 max-h-[400px] overflow-y-auto">
                  {result.inci_analysis.tokens.map((t) => (
                    <InciCard key={t.rank} token={t} />
                  ))}
                </div>
                <Link
                  href={`/inci-analiz?prefill=${encodeURIComponent((result.vision_result?.ingredients_list || []).join(', '))}`}
                  className="block text-center text-xs text-primary hover:underline"
                >
                  Tam INCI Analiz Sayfasında Aç →
                </Link>

                {/* Kullaniciyi sistemi gelistirmeye davet */}
                <div className="border-t border-outline-variant/20 pt-4 mt-4">
                  <div className="text-center">
                    <span className="material-icon text-primary text-[20px] mb-1 block" aria-hidden="true">help_outline</span>
                    <p className="text-sm font-semibold text-on-surface mb-1">Bu hangi ürün?</p>
                    <p className="text-xs text-on-surface-variant mb-3">
                      Şimdi ürünün <strong>ön yüzünü</strong> veya kutu marka kısmını da çekersen, REVELA kataloğa ekler ve diğer kullanıcılar da bu üründen yararlanır.
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-2 text-sm bg-primary/10 text-primary px-4 py-2 rounded-md hover:bg-primary/15 transition">
                      <span className="material-icon text-[18px]" aria-hidden="true">photo_camera</span>
                      Ürün Fotoğrafı Ekle
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-outline mt-2">+ Pionér katkı rozeti</p>
                  </div>
                </div>
              </div>
            )}

            {result.status === 'candidates' && result.vision_result?.source === 'openbeautyfacts' && (
              <div className="curator-card p-6 space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 mb-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs">
                    <span className="material-icon text-[14px]">explore</span>
                    Yeni keşif — Pionér rozeti
                  </div>
                  <h2 className="text-lg font-bold text-on-surface mb-1">
                    {result.vision_result.brand || '—'} · {result.vision_result.product_name || 'Ürün'}
                  </h2>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                    REVELA katalogunda henüz yoktu. OpenBeautyFacts kaynağından bilgileri çektik.
                    İncelemeden geçirip kataloğa ekleyeceğiz.
                  </p>
                </div>
                {result.vision_result.image_url && (
                  <div className="flex justify-center">
                    <img
                      src={result.vision_result.image_url}
                      alt={result.vision_result.product_name || ''}
                      className="max-w-[180px] max-h-[180px] object-contain rounded"
                    />
                  </div>
                )}
                {result.vision_result.ingredients_list && result.vision_result.ingredients_list.length > 0 && (
                  <div className="bg-surface-container-low rounded-sm p-3">
                    <div className="text-[10px] uppercase tracking-wider text-outline mb-1">INCI (OpenBeautyFacts)</div>
                    <p className="text-xs text-on-surface leading-relaxed">
                      {result.vision_result.ingredients_list.slice(0, 15).join(', ')}
                      {result.vision_result.ingredients_list.length > 15 && ` … +${result.vision_result.ingredients_list.length - 15}`}
                    </p>
                  </div>
                )}
                <Link
                  href={`/inci-analiz?prefill=${encodeURIComponent((result.vision_result.ingredients_list || []).join(', '))}`}
                  className="curator-btn-primary block text-center text-sm py-3"
                >
                  REVELA Skoru Hesapla →
                </Link>
                <p className="text-[10px] text-outline text-center">
                  Kaynak: OpenBeautyFacts (CC-BY-SA) · Barkod: {result.vision_result.barcode}
                </p>
              </div>
            )}

            {result.status === 'candidates' && result.candidates && result.candidates.length > 0 && (
              <div className="curator-card p-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-on-surface mb-1">Birkaç seçenek buldum</h2>
                  <p className="text-xs text-on-surface-variant">Aradığın bunlardan biri mi?</p>
                </div>
                <div className="space-y-2">
                  {result.candidates.map((c) => (
                    <Link
                      key={c.product_id}
                      href={`/urunler/${c.product_slug}?scan=1`}
                      className="block border border-outline-variant/30 rounded-sm p-3 hover:bg-surface-container-low transition-colors"
                    >
                      <div className="text-xs text-on-surface-variant">{c.brand_name}</div>
                      <div className="text-sm font-semibold text-on-surface">{c.product_name}</div>
                      <div className="text-[10px] text-outline mt-0.5">Benzerlik: %{Math.round(c.similarity * 100)}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {result.status === 'unknown' && (
              <div className="curator-card p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto">
                  <span className="material-icon text-outline text-[32px]" aria-hidden="true">help_outline</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface mb-1">Ürün bulunamadı</h2>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    Tarayan ekibimize bildirdik — veritabanına eklenecek. Belki gördüğün marka veya ürün adını bize yazabilirsin.
                  </p>
                  {result.vision_result?.brand && (
                    <p className="text-xs text-on-surface mt-2">
                      AI tahmini: <strong>{result.vision_result.brand}</strong>
                      {result.vision_result.product_name && ` · ${result.vision_result.product_name}`}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="curator-btn-primary text-sm px-6 py-3"
                type="button"
              >
                Yeni Tarama
              </button>
              <Link
                href="/urunler"
                className="px-5 py-3 text-sm text-on-surface-variant border border-outline-variant/30 rounded-sm hover:bg-surface-container-low transition-colors"
              >
                Katalogda Ara
              </Link>
            </div>
          </div>
        )}

        {/* Error state */}
        {phase === 'error' && (
          <div className="curator-card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto">
              <span className="material-icon text-error text-[32px]" aria-hidden="true">error</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface mb-2">Bir sorun oldu</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">{error}</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={reset} className="curator-btn-primary text-sm px-6 py-3" type="button">
                Tekrar Dene
              </button>
              <Link
                href="/urunler"
                className="px-5 py-3 text-sm text-on-surface-variant border border-outline-variant/30 rounded-sm hover:bg-surface-container-low transition-colors"
              >
                Katalogda Ara
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* OCR scanning effect — profesyonel taramayor cizgisi */}
      <style jsx>{`
        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(var(--color-primary-rgb, 79, 124, 241), 0.95), transparent);
          box-shadow: 0 0 14px 4px rgba(var(--color-primary-rgb, 79, 124, 241), 0.4);
          animation: scan-sweep 1.6s ease-in-out infinite;
        }
        @keyframes scan-sweep {
          0%   { top: 0%; opacity: 0; }
          10%  { opacity: 1; }
          50%  { top: 96%; opacity: 1; }
          60%  { opacity: 0; top: 96%; }
          61%  { top: 0%; opacity: 0; }
          70%  { opacity: 1; }
          100% { top: 0%; opacity: 0; }
        }
        .process-pulse {
          animation: process-pulse 2s ease-in-out infinite;
        }
        @keyframes process-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }
        .dot-anim {
          animation: dot-blink 1.4s ease-in-out infinite;
          color: rgb(var(--color-primary-rgb, 79, 124, 241));
          font-weight: 900;
        }
        @keyframes dot-blink {
          0%, 60%, 100% { opacity: 0.2; }
          30%           { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
