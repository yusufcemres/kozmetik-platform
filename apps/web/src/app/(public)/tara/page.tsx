'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { detectBarcodeFromVideo, captureVideoFrame, blobToBase64 } from '@/lib/barcode';
import { smartScan, ScanResponse } from '@/lib/smart-scan';

type Phase = 'idle' | 'permission' | 'scanning' | 'processing' | 'result' | 'error';

export default function TaraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [hint, setHint] = useState('Ürünü çerçeveye hizala');

  const stopCamera = useCallback(() => {
    if (scanLoopRef.current !== null) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    setPhase('permission');
    setError('');
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase('scanning');
      setHint('Ürünü çerçeveye hizala — otomatik taranır');
      loopBarcode();
    } catch (err: any) {
      setPhase('error');
      setError(err.message || 'Kamera erişimi reddedildi');
    }
  };

  const loopBarcode = useCallback(() => {
    if (!videoRef.current || phase === 'processing' || phase === 'result') return;
    const video = videoRef.current;
    let attempts = 0;

    const tick = async () => {
      if (!streamRef.current) return;
      attempts++;
      try {
        const found = await detectBarcodeFromVideo(video);
        if (found) {
          await handleDetected({ barcode: found.rawValue });
          return;
        }
      } catch {}

      // After ~3s of no barcode, hint about manual capture
      if (attempts === 20) {
        setHint('Barkod yoksa "Çek" butonu ile ürünü fotoğrafla');
      }
      scanLoopRef.current = requestAnimationFrame(tick);
    };
    scanLoopRef.current = requestAnimationFrame(tick);
  }, [phase]);

  const handleDetected = async (body: { barcode?: string; image_base64?: string; image_mime?: string }) => {
    setPhase('processing');
    setHint('Eşleştiriliyor…');
    stopCamera();
    try {
      const res = await smartScan(body);
      setResult(res);
      setPhase('result');

      // Auto-redirect on high confidence match
      if (res.status === 'matched' && res.confidence >= 0.8) {
        setTimeout(() => router.push(`/urunler/${res.product!.product_slug}?scan=1`), 1400);
      }
    } catch (err: any) {
      setPhase('error');
      setError(err.message || 'Tarama başarısız');
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
  };

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

            <button onClick={startCamera} className="curator-btn-primary text-sm px-8 py-3">
              <span className="material-icon material-icon-sm mr-2" aria-hidden="true">photo_camera</span>
              Kamerayı Aç
            </button>
          </div>
        )}

        {/* Permission state */}
        {phase === 'permission' && (
          <div className="curator-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="material-icon text-primary text-[32px]" aria-hidden="true">photo_camera</span>
            </div>
            <p className="text-sm text-on-surface-variant">Kamera izni isteniyor…</p>
          </div>
        )}

        {/* Scanning / processing state */}
        {(phase === 'scanning' || phase === 'processing') && (
          <div className="space-y-4">
            <div className="relative aspect-[3/4] sm:aspect-video bg-black rounded-sm overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
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
                {phase === 'processing' ? 'Eşleştiriliyor…' : hint}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { stopCamera(); reset(); }}
                className="px-5 py-3 text-sm text-on-surface-variant border border-outline-variant/30 rounded-sm hover:bg-surface-container-low transition-colors"
              >
                İptal
              </button>
              <button
                onClick={capturePhoto}
                disabled={phase === 'processing'}
                className="curator-btn-primary text-sm px-6 py-3 disabled:opacity-50"
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
                <Link
                  href={`/urunler/${result.product.product_slug}?scan=1`}
                  className="curator-btn-primary text-sm px-6 py-3 inline-flex items-center"
                >
                  Tam Bilgiyi Gör
                  <span className="material-icon material-icon-sm ml-2" aria-hidden="true">arrow_forward</span>
                </Link>
              </div>
            )}

            {result.status === 'candidates' && result.candidates && (
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
              <p className="text-sm text-on-surface-variant">{error}</p>
            </div>
            <button onClick={reset} className="curator-btn-primary text-sm px-6 py-3">
              Tekrar Dene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
