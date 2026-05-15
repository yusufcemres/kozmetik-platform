/**
 * MediaPipe Face Landmarker — lazy loader.
 *
 * 2026-05-16 Foto Analiz Faz 1 Gün 4 ile eklendi.
 * Model boyutu ~6MB (face_landmarker.task), CDN'den lazy fetch.
 *
 * Browser support: Chrome 90+, Safari 16.4+, Firefox 88+.
 * WASM gerekiyor — eski mobiller fallback (server-side Gemini Vision yalın).
 */

import type { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let landmarkerPromise: Promise<FaceLandmarker | null> | null = null;

/**
 * Singleton loader — tek model instance, sayfa boyunca reuse.
 * İlk çağrı CDN'den ~6MB indirir; sonraki çağrılar anında döner.
 */
export async function getFaceLandmarker(): Promise<FaceLandmarker | null> {
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = (async () => {
    try {
      const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision');
      const filesetResolver: FilesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
      );
      const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: false, // performans için kapalı
        runningMode: 'IMAGE', // tek foto analiz (VIDEO mode realtime için)
        numFaces: 1,
      });
      return landmarker;
    } catch (err) {
      // WASM yüklenmediği durumlarda (eski tarayıcı, network) null döner
      // — caller fallback yapar (server-side Gemini Vision)
      console.warn('[face-landmarker] load failed:', err);
      return null;
    }
  })();

  return landmarkerPromise;
}

/** Loader'ı sıfırla (test için). */
export function resetFaceLandmarker(): void {
  landmarkerPromise = null;
}
