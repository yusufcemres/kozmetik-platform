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
  /** Vazgeç (modal kapat) */
  onCancel?: () => void;
}

export function CaptureGuard({ onCapture, onCancel }: CaptureGuardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'init' | 'requesting' | 'ready' | 'analyzing' | 'denied' | 'error'>('init');
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<CaptureQualityScore | null>(null);

  // Kamera izni + stream başlat
  useEffect(() => {
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
      } catch (err: any) {
        if (cancelled) return;
        if (err.name === 'NotAllowedError') {
          setStatus('denied');
          setError('Kamera izni verilmedi. Lütfen tarayıcı ayarlarından izin verin.');
        } else {
          setStatus('error');
          setError(err.message || 'Kamera başlatılamadı');
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
  }, []);

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
    }
  }, [onCapture]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-on-surface mb-1">Cilt Analizi — Foto Çek</h2>
        <p className="text-sm text-on-surface-variant">Yüzünüzü çerçeve içine alın, iyi aydınlık + sabit tutun</p>
      </div>

      <MedicalDisclaimer variant="inline" />

      {/* Kamera preview */}
      <div className="relative rounded-lg overflow-hidden bg-surface-container-low aspect-[3/4] mb-4 mt-3">
        {status === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
            <div className="text-center">
              <span className="material-icon text-4xl block mb-2" aria-hidden="true">photo_camera</span>
              <p className="text-sm">Kamera izni isteniyor…</p>
            </div>
          </div>
        )}

        {(status === 'denied' || status === 'error') && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <span className="material-icon text-4xl block mb-3 text-error" aria-hidden="true">error</span>
              <p className="text-sm text-on-surface mb-3">{error}</p>
              <p className="text-xs text-on-surface-variant">
                Tarayıcınızda kilit ikonuna tıklayıp kamera iznini açabilirsiniz.
              </p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover ${status === 'ready' || status === 'analyzing' ? '' : 'hidden'}`}
          aria-label="Kamera preview"
        />

        {/* Yüz oval guide overlay */}
        {(status === 'ready' || status === 'analyzing') && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[60%] aspect-[3/4] border-2 border-white/50 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {status === 'analyzing' && (
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
        <button
          onClick={handleCapture}
          disabled={status !== 'ready' && status !== 'analyzing'}
          className="curator-btn-primary text-sm px-6 py-3 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'analyzing' ? 'Analiz ediliyor…' : quality && !quality.passed ? 'Tekrar Çek' : 'Foto Çek'}
        </button>
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
