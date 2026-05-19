'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getFaceLandmarker } from '@/lib/face-landmarker/loader';
import { analyzeCaptureQuality, type CaptureQualityScore } from '@/lib/face-landmarker/capture-quality';
import { MedicalDisclaimer } from '@/components/public/MedicalDisclaimer';

/**
 * Foto Analiz çekim guard komponenti.
 *
 * 2026-05-16 Foto Analiz Faz 1 Gün 4 ile eklendi.
 *
 * Akış:
 * 1. Kamera izni iste → video stream başlat
 * 2. Canvas overlay (yüz oval guide + bölge maskeleri)
 * 3. "Foto Çek" butonu → canvas snapshot → MediaPipe FaceLandmarker analiz
 * 4. Kalite skoru ≥70 ise onaylı (base64 + guard_score onCapture'a verilir)
 * 5. <70 → kullanıcıya feedback ("yüz net değil", "çok karanlık" vs.)
 *
 * Caller: parent component onCapture callback alır, /api/v1/skin-analysis'e POST eder.
 */

export interface CaptureGuardProps {
  /** Foto çekildi + kalite geçti → base64 + mime + guard_score gönderir */
  onCapture: (data: { base64: string; mime: string; guard_score: number }) => void;
  /**
   * Faz 2 #3 — on-device scorer için ham veri.
   * Verilmişse `onCapture`'a ek olarak çağrılır, ImageData + landmarker
   * sonucunu da geçirir. Caller bunları on-device skorlama için kullanır
   * (Vision API'ye gitmeden).
   */
  onCaptureRaw?: (data: {
    base64: string;
    mime: string;
    guard_score: number;
    imageData: ImageData;
    // FaceLandmarkerResult — type import etmemek için unknown
    landmarkerResult: unknown;
  }) => void;
  /** Vazgeç (modal kapat) */
  onCancel?: () => void;
  /** Default mod — 'camera' (canlı çekim) veya 'upload' (galeriden seç). Default 'camera'. */
  defaultMode?: 'camera' | 'upload';
}

type CaptureMode = 'camera' | 'upload';

export function CaptureGuard({ onCapture, onCaptureRaw, onCancel, defaultMode = 'camera' }: CaptureGuardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<CaptureMode>(defaultMode);
  const [status, setStatus] = useState<'init' | 'requesting' | 'ready' | 'analyzing' | 'denied' | 'error'>('init');
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<CaptureQualityScore | null>(null);

  // Kamera izni + stream başlat (sadece camera modunda)
  useEffect(() => {
    if (mode !== 'camera') {
      setStatus('ready'); // upload modunda kamera gerekmez
      return;
    }
    let cancelled = false;
    setStatus('requesting');

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        const e = err as { name?: string; message?: string };
        if (e?.name === 'NotAllowedError') {
          setStatus('denied');
          setError('Kamera izni verilmedi. Lütfen tarayıcı ayarlarından izin verin veya "Galeriden Seç" deneyin.');
        } else {
          setStatus('error');
          setError(e?.message || 'Kamera başlatılamadı');
        }
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [mode]);

  // File upload handler (galeriden seç)
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.type)) {
      setError('Sadece JPEG, PNG veya WebP foto seçebilirsin.');
      setStatus('error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Foto 5MB üstünde. Daha küçük bir foto seç.');
      setStatus('error');
      return;
    }
    setStatus('analyzing');
    setQuality(null);
    setError(null);

    // Foto'yu canvas'a yükle (kalite analizi için pixel data)
    const img = new Image();
    const url = URL.createObjectURL(file);
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Foto okunamadı'));
        img.src = url;
      });
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas erişilemedi');
      // Resize: maksimum 1280px (vision API maliyet + transfer)
      const maxDim = 1280;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context yok');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const landmarker = await getFaceLandmarker();
      let landmarkerResult = null;
      if (landmarker) {
        try {
          landmarkerResult = landmarker.detect(canvas);
        } catch (lerr) {
          console.warn('[upload] landmarker detect failed:', lerr);
        }
      }

      const qual = analyzeCaptureQuality(landmarkerResult, imageData, canvas.width, canvas.height);
      setQuality(qual);
      setStatus('ready');

      if (qual.passed) {
        const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1] ?? '';
        onCapture({ base64, mime: 'image/jpeg', guard_score: qual.overall });
        onCaptureRaw?.({
          base64,
          mime: 'image/jpeg',
          guard_score: qual.overall,
          imageData,
          landmarkerResult,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Foto işlenemedi');
      setStatus('error');
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [onCapture, onCaptureRaw]);

  // Foto çek + analiz
  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setStatus('analyzing');
    setQuality(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setStatus('error');
      setError('Canvas erişilemedi');
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // MediaPipe Face Landmarker
    const landmarker = await getFaceLandmarker();
    let landmarkerResult = null;
    if (landmarker) {
      try {
        landmarkerResult = landmarker.detect(canvas);
      } catch (err) {
        console.warn('[capture] landmarker detect failed:', err);
      }
    }

    const qual = analyzeCaptureQuality(landmarkerResult, imageData, canvas.width, canvas.height);
    setQuality(qual);
    setStatus('ready');

    if (qual.passed) {
      const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1] ?? '';
      onCapture({ base64, mime: 'image/jpeg', guard_score: qual.overall });
      onCaptureRaw?.({
        base64,
        mime: 'image/jpeg',
        guard_score: qual.overall,
        imageData,
        landmarkerResult,
      });
    }
  }, [onCapture, onCaptureRaw]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-on-surface mb-1">Cilt Analizi — Foto</h2>
        <p className="text-sm text-on-surface-variant">
          {mode === 'camera'
            ? 'Yüzünüzü çerçeve içine alın, iyi aydınlık + sabit tutun'
            : 'Galerinizden net bir yüz fotoğrafı seçin'}
        </p>
      </div>

      {/* Mod toggle — kamera vs upload */}
      <div className="flex gap-2 justify-center mb-4">
        <button
          onClick={() => setMode('camera')}
          className={`text-xs px-4 py-2 rounded-full border transition-colors ${
            mode === 'camera'
              ? 'bg-primary text-on-primary border-primary'
              : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low'
          }`}
          aria-pressed={mode === 'camera'}
        >
          📷 Kamera
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`text-xs px-4 py-2 rounded-full border transition-colors ${
            mode === 'upload'
              ? 'bg-primary text-on-primary border-primary'
              : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low'
          }`}
          aria-pressed={mode === 'upload'}
        >
          🖼️ Galeriden Seç
        </button>
      </div>

      <MedicalDisclaimer variant="inline" />

      {/* Kamera preview veya upload zonu */}
      <div className="relative rounded-lg overflow-hidden bg-surface-container-low aspect-[3/4] mb-4 mt-3">
        {/* Upload mode UI */}
        {mode === 'upload' && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <span className="material-icon text-6xl block mb-3 text-on-surface-variant" aria-hidden="true">add_photo_alternate</span>
              <p className="text-sm text-on-surface mb-2">Galerinden net bir yüz fotoğrafı seç</p>
              <p className="text-xs text-on-surface-variant mb-4">JPEG, PNG veya WebP — max 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                disabled={status === 'analyzing'}
                className="hidden"
                id="skin-analysis-file-input"
              />
              <label
                htmlFor="skin-analysis-file-input"
                className={`inline-block curator-btn-primary text-sm px-6 py-3 cursor-pointer ${
                  status === 'analyzing' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {status === 'analyzing' ? 'Analiz ediliyor…' : 'Dosya Seç'}
              </label>
              {error && (
                <p className="text-xs text-error mt-3">{error}</p>
              )}
            </div>
          </div>
        )}

        {/* Camera mode UI */}
        {mode === 'camera' && status === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
            <div className="text-center">
              <span className="material-icon text-4xl block mb-2" aria-hidden="true">photo_camera</span>
              <p className="text-sm">Kamera izni isteniyor…</p>
            </div>
          </div>
        )}

        {mode === 'camera' && (status === 'denied' || status === 'error') && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <span className="material-icon text-4xl block mb-3 text-error" aria-hidden="true">error</span>
              <p className="text-sm text-on-surface mb-3">{error}</p>
              <p className="text-xs text-on-surface-variant mb-4">
                Tarayıcı izni kapalıysa kilit ikonuna tıkla, veya
              </p>
              <button
                onClick={() => { setMode('upload'); setError(null); }}
                className="text-xs text-primary underline hover:text-primary/80"
              >
                Galeriden Foto Seç
              </button>
            </div>
          </div>
        )}

        {mode === 'camera' && (
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${status === 'ready' || status === 'analyzing' ? '' : 'hidden'}`}
            aria-label="Kamera preview"
          />
        )}

        {/* Yüz oval guide overlay (sadece camera) */}
        {mode === 'camera' && (status === 'ready' || status === 'analyzing') && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[60%] aspect-[3/4] border-2 border-white/50 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
            </div>
          </div>
        )}

        {/* Loading overlay (her iki mod) */}
        {status === 'analyzing' && mode === 'camera' && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-surface px-4 py-3 rounded-sm shadow-lg">
              <p className="text-sm text-on-surface">Analiz ediliyor…</p>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Quality feedback */}
      {quality && !quality.passed && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-900 dark:text-amber-200 mb-4">
          <p className="font-semibold mb-2">Foto kalitesi: {quality.overall}/100 — tekrar çekmeyi deneyin</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            {quality.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {mode === 'camera' && (
          <button
            onClick={handleCapture}
            disabled={status !== 'ready' && status !== 'analyzing'}
            className="curator-btn-primary text-sm px-6 py-3 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'analyzing' ? 'Analiz ediliyor…' : quality && !quality.passed ? 'Tekrar Çek' : 'Foto Çek'}
          </button>
        )}
        {mode === 'upload' && quality && !quality.passed && (
          <button
            onClick={() => { setQuality(null); setError(null); fileInputRef.current?.click(); }}
            className="curator-btn-primary text-sm px-6 py-3 flex-1"
          >
            Başka Foto Seç
          </button>
        )}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-on-surface-variant border border-outline-variant/30 rounded-sm px-4 py-3 hover:bg-surface-container-low transition-colors"
          >
            Vazgeç
          </button>
        )}
      </div>

      {quality && quality.passed && (
        <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800 px-4 py-3 text-sm text-green-900 dark:text-green-200 mt-4">
          <p className="font-semibold">✓ Foto onaylandı (kalite: {quality.overall}/100) — analiz başlatılıyor…</p>
        </div>
      )}
    </div>
  );
}
