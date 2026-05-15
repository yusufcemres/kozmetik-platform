/**
 * Çekim guard — foto kalitesi analiz mantığı.
 *
 * 2026-05-16 Foto Analiz Faz 1 Gün 4 ile eklendi.
 *
 * Skor 0-100 (yüksek = daha iyi). 4 alt-metrik:
 *   - face_presence: Yüz tespit edildi mi (478 landmark)
 *   - face_centered: Yüz frame ortasında mı (ovalness ratio)
 *   - brightness: Ortalama parlaklık 80-200 aralığında mı
 *   - sharpness: Bulanıklık skoru (Laplacian variance proxy)
 *
 * ≥70 skor → upload onaylı. <70 → kullanıcıya "tekrar çek" feedback.
 */

import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface CaptureQualityScore {
  /** 0-100 — yüksek = daha iyi */
  overall: number;
  /** Alt-metrikler (debug + UI feedback) */
  breakdown: {
    face_presence: number;
    face_centered: number;
    brightness: number;
    sharpness: number;
  };
  /** İnsan-okunur sebep (kullanıcıya gösterilir) */
  reasons: string[];
  /** True ise upload edilebilir, false ise tekrar çek */
  passed: boolean;
}

const PASS_THRESHOLD = 70;

/**
 * Foto + Face Landmarker sonucu → kalite skoru.
 *
 * @param landmarkerResult MediaPipe çıktısı (faceLandmarks dolu/boş olabilir)
 * @param imageData Canvas'tan alınmış pixel verisi (parlaklık + sharpness için)
 * @param canvasWidth + canvasHeight Frame ölçüleri (centering için)
 */
export function analyzeCaptureQuality(
  landmarkerResult: FaceLandmarkerResult | null,
  imageData: ImageData,
  canvasWidth: number,
  canvasHeight: number,
): CaptureQualityScore {
  const reasons: string[] = [];

  // 1. Face presence — landmark var mı, 478 nokta tam mı
  const hasFace = !!(landmarkerResult && landmarkerResult.faceLandmarks && landmarkerResult.faceLandmarks.length > 0);
  const facePoints = hasFace ? landmarkerResult!.faceLandmarks[0] : [];
  const face_presence = hasFace && facePoints.length >= 400 ? 100 : 0;
  if (face_presence < 50) {
    reasons.push('Yüz tespit edilemedi — fotoğrafa yüzünüzün net görünmesi gerekiyor');
  }

  // 2. Face centering — yüz frame ortasında mı, oval içine sığıyor mu
  let face_centered = 0;
  if (hasFace && facePoints.length > 0) {
    // Bounding box hesapla
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const pt of facePoints) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
    const faceCenterX = (minX + maxX) / 2;
    const faceCenterY = (minY + maxY) / 2;
    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;

    // Frame merkezinden sapma (0-0.5, 0 = tam ortada)
    const offsetX = Math.abs(faceCenterX - 0.5);
    const offsetY = Math.abs(faceCenterY - 0.5);
    const offset = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

    // Yüz frame'in %40-80'ini kaplamalı
    const sizeRatio = (faceWidth + faceHeight) / 2;
    const sizeOk = sizeRatio >= 0.3 && sizeRatio <= 0.85;

    face_centered = Math.round(Math.max(0, 100 - offset * 200)); // ofset 0 → 100, ofset 0.5 → 0
    if (!sizeOk) {
      face_centered = Math.round(face_centered * 0.5);
      if (sizeRatio < 0.3) reasons.push('Yüzünüz çok küçük — kameraya yaklaşın');
      else reasons.push('Yüzünüz frame dışına taşıyor — biraz uzaklaşın');
    } else if (face_centered < 60) {
      reasons.push('Yüzünüzü çerçevenin ortasına alın');
    }
  }

  // 3. Brightness — ortalama luminance (Y kanalı, BT.601)
  let totalLum = 0;
  const pixels = imageData.data;
  const sampleEvery = Math.max(1, Math.floor(pixels.length / (4 * 10000))); // ~10K sample
  let sampleCount = 0;
  for (let i = 0; i < pixels.length; i += 4 * sampleEvery) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLum += lum;
    sampleCount++;
  }
  const avgLum = sampleCount > 0 ? totalLum / sampleCount : 0;

  // İdeal aralık 80-200; <60 çok karanlık, >220 çok parlak
  let brightness: number;
  if (avgLum < 60) {
    brightness = Math.round(Math.max(0, avgLum / 60 * 50));
    reasons.push('Çok karanlık — daha aydınlık bir ortama geçin');
  } else if (avgLum > 220) {
    brightness = Math.round(Math.max(0, 100 - (avgLum - 220) * 5));
    reasons.push('Çok parlak — direkt güneş ışığından kaçının');
  } else {
    brightness = 100;
  }

  // 4. Sharpness — basit gradyan-bazlı (Sobel benzeri) edge variance
  // Yüksek varyans = keskin, düşük varyans = bulanık
  let edgeVariance = 0;
  let edgeSamples = 0;
  const w = imageData.width;
  for (let y = 5; y < imageData.height - 5; y += 10) {
    for (let x = 5; x < w - 5; x += 10) {
      const i = (y * w + x) * 4;
      const center = pixels[i] + pixels[i + 1] + pixels[i + 2];
      const right = pixels[i + 4] + pixels[i + 5] + pixels[i + 6];
      const down = pixels[i + w * 4] + pixels[i + w * 4 + 1] + pixels[i + w * 4 + 2];
      edgeVariance += Math.abs(center - right) + Math.abs(center - down);
      edgeSamples++;
    }
  }
  const avgEdge = edgeSamples > 0 ? edgeVariance / edgeSamples : 0;
  // Threshold: avgEdge > 40 → keskin, < 15 → çok bulanık (deneysel)
  let sharpness: number;
  if (avgEdge < 15) {
    sharpness = Math.round(avgEdge / 15 * 50);
    reasons.push('Foto bulanık — telefonu sabit tutun');
  } else {
    sharpness = Math.min(100, Math.round((avgEdge / 60) * 100));
  }

  // Overall: ağırlıklı ortalama
  // face_presence kritik (≥50 olmalı), diğerleri ağırlıklı
  let overall = 0;
  if (face_presence >= 50) {
    overall = Math.round(
      face_presence * 0.35 + face_centered * 0.25 + brightness * 0.20 + sharpness * 0.20,
    );
  } else {
    overall = Math.round(face_presence * 0.5); // Yüz yoksa kritik fail
  }

  return {
    overall,
    breakdown: { face_presence, face_centered, brightness, sharpness },
    reasons,
    passed: overall >= PASS_THRESHOLD,
  };
}
