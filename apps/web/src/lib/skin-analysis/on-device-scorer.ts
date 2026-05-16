/**
 * On-device 6-boyut cilt skoru — MediaPipe face landmark + ImageData üzerinde
 * klasik computer vision (color/edge/luminance) ile yerel hesaplama.
 *
 * 2026-05-17 Faz 2 #3 — Vision API'siz freemium tier.
 *
 * Doğruluk: Gemini/Claude'un ~%60-70'i (genel trend doğru, mutlak skor farkı olabilir).
 * Avantaj: KVKK net, foto cihaz dışına çıkmaz, ücretsiz, sınırsız (rate limit yok),
 * latency ~50-100ms (network round-trip yerine direkt CPU).
 *
 * Production'da Premium tier hâlâ Vision API kullanır (daha doğru); on-device free
 * tier için pratik bir baseline.
 */

import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface OnDeviceSkinScore {
  t_zone_oil: number;
  pore_visibility: number;
  wrinkles: number;
  pigmentation: number;
  redness: number;
  under_eye_darkness: number;
  acne_count: number;
  fitzpatrick_type: number;
}

export interface OnDeviceScoreResult {
  scores: OnDeviceSkinScore;
  overall_score: number;
  model_version: 'on-device-cv-v1';
  /** Hangi bölgelerden veri çekildi (debug + güven sinyali) */
  rois_extracted: string[];
}

// Landmark grupları (478 nokta indexleri — MediaPipe FaceLandmarker)
// Reference: https://github.com/google/mediapipe/blob/master/mediapipe/python/solutions/face_mesh_connections.py
const LANDMARK_GROUPS = {
  forehead: [10, 67, 103, 297, 332, 338, 109, 108, 151],
  t_zone_nose: [1, 2, 5, 4, 195, 6, 197, 168],
  cheek_left: [50, 101, 36, 205, 187, 192, 213, 138, 215],
  cheek_right: [280, 330, 266, 425, 411, 416, 433, 367, 435],
  under_eye_left: [119, 100, 47, 121, 230, 232, 231, 228],
  under_eye_right: [348, 329, 277, 350, 450, 452, 451, 448],
  mouth_corners: [61, 291, 76, 306, 62, 78, 191, 308],
  eye_outer_corners: [33, 263, 7, 246, 161, 160, 159, 158, 466, 388, 387, 386, 385, 384],
} as const;

type RoiName = keyof typeof LANDMARK_GROUPS;

interface PixelStats {
  count: number;
  rMean: number;
  gMean: number;
  bMean: number;
  lumMean: number;
  lumStd: number;
  /** Edge intensity proxy (gradient absolute sum / pixel count) */
  edgeStrength: number;
  /** Specular pixel oranı (luminance > 220) */
  specularRatio: number;
}

/**
 * Landmark dizisinden ROI bounding box çıkar + pixel istatistikleri hesapla.
 * Landmark koordinatları normalize (0-1), ImageData pixel space'e mapping.
 */
function sampleRoi(
  landmarks: { x: number; y: number }[],
  group: readonly number[],
  imageData: ImageData,
): PixelStats {
  // Bounding box hesapla (landmark indekslerinden)
  const xs: number[] = [];
  const ys: number[] = [];
  for (const idx of group) {
    const pt = landmarks[idx];
    if (!pt) continue;
    xs.push(pt.x * imageData.width);
    ys.push(pt.y * imageData.height);
  }
  if (xs.length === 0) {
    return { count: 0, rMean: 0, gMean: 0, bMean: 0, lumMean: 0, lumStd: 0, edgeStrength: 0, specularRatio: 0 };
  }
  const minX = Math.max(0, Math.floor(Math.min(...xs)));
  const maxX = Math.min(imageData.width - 1, Math.ceil(Math.max(...xs)));
  const minY = Math.max(0, Math.floor(Math.min(...ys)));
  const maxY = Math.min(imageData.height - 1, Math.ceil(Math.max(...ys)));

  const data = imageData.data;
  const w = imageData.width;
  let count = 0;
  let rSum = 0, gSum = 0, bSum = 0, lumSum = 0, lumSqSum = 0;
  let edgeSum = 0;
  let specular = 0;

  // Sample her pixel (small ROI olduğu için tam tarama OK)
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      rSum += r; gSum += g; bSum += b;
      lumSum += lum;
      lumSqSum += lum * lum;
      if (lum > 220) specular++;
      // Edge (sağ ve aşağı komşu farkı)
      if (x < maxX && y < maxY) {
        const iRight = (y * w + x + 1) * 4;
        const iDown = ((y + 1) * w + x) * 4;
        const lumRight = 0.299 * data[iRight] + 0.587 * data[iRight + 1] + 0.114 * data[iRight + 2];
        const lumDown = 0.299 * data[iDown] + 0.587 * data[iDown + 1] + 0.114 * data[iDown + 2];
        edgeSum += Math.abs(lum - lumRight) + Math.abs(lum - lumDown);
      }
      count++;
    }
  }
  if (count === 0) {
    return { count: 0, rMean: 0, gMean: 0, bMean: 0, lumMean: 0, lumStd: 0, edgeStrength: 0, specularRatio: 0 };
  }
  const lumMean = lumSum / count;
  const lumVar = lumSqSum / count - lumMean * lumMean;
  return {
    count,
    rMean: rSum / count,
    gMean: gSum / count,
    bMean: bSum / count,
    lumMean,
    lumStd: Math.sqrt(Math.max(0, lumVar)),
    edgeStrength: edgeSum / count,
    specularRatio: specular / count,
  };
}

// 0-100 clamp
const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

/**
 * Ana skor fonksiyonu — landmarker null veya yüz yoksa null döner.
 * Caller bu null durumda Vision API'ye fallback yapabilir.
 */
export function scoreSkinOnDevice(
  landmarkerResult: FaceLandmarkerResult | null,
  imageData: ImageData,
): OnDeviceScoreResult | null {
  if (!landmarkerResult || !landmarkerResult.faceLandmarks || landmarkerResult.faceLandmarks.length === 0) {
    return null;
  }
  const landmarks = landmarkerResult.faceLandmarks[0];
  if (landmarks.length < 400) return null;

  // ROI istatistikleri
  const rois: Record<RoiName, PixelStats> = {} as any;
  const extracted: string[] = [];
  for (const name of Object.keys(LANDMARK_GROUPS) as RoiName[]) {
    const stats = sampleRoi(landmarks as any, LANDMARK_GROUPS[name], imageData);
    rois[name] = stats;
    if (stats.count > 0) extracted.push(name);
  }

  // 1. T-zone oil — alın + burun specular oranı (kullanıcının T-bölgesinde parlama)
  const tzoneSpec = (rois.forehead.specularRatio + rois.t_zone_nose.specularRatio) / 2;
  // 0% specular → 0 skor, 30%+ → 100
  const t_zone_oil = clamp(tzoneSpec * 300);

  // 2. Pore visibility — cheek+nose edge density (yüksek freq detail)
  const poreEdge = (rois.cheek_left.edgeStrength + rois.cheek_right.edgeStrength + rois.t_zone_nose.edgeStrength) / 3;
  // edgeStrength tipik 5-40 aralık; 5 → 20 skor, 30+ → 100
  const pore_visibility = clamp((poreEdge - 5) * 4);

  // 3. Wrinkles — forehead + eye outer corner + mouth corner edge density
  const wrinkleEdge = (rois.forehead.edgeStrength + rois.eye_outer_corners.edgeStrength + rois.mouth_corners.edgeStrength) / 3;
  const wrinkles = clamp((wrinkleEdge - 6) * 3.5);

  // 4. Pigmentation — luminance std cheek+forehead (eşit ton = düşük std)
  const pigStd = (rois.cheek_left.lumStd + rois.cheek_right.lumStd + rois.forehead.lumStd) / 3;
  // 10 std → 20 skor, 40+ → 100
  const pigmentation = clamp((pigStd - 10) * 2.5);

  // 5. Redness — cheek R dominance vs G+B ortalaması
  const cheekR = (rois.cheek_left.rMean + rois.cheek_right.rMean) / 2;
  const cheekGB = (rois.cheek_left.gMean + rois.cheek_left.bMean + rois.cheek_right.gMean + rois.cheek_right.bMean) / 4;
  const noseR = rois.t_zone_nose.rMean;
  const noseGB = (rois.t_zone_nose.gMean + rois.t_zone_nose.bMean) / 2;
  const rednessRaw = ((cheekR - cheekGB) + (noseR - noseGB)) / 2;
  // 5 → 20 skor, 35+ → 100
  const redness = clamp((rednessRaw - 5) * 3);

  // 6. Under-eye darkness — under_eye luminance vs cheek luminance farkı
  const underEyeLum = (rois.under_eye_left.lumMean + rois.under_eye_right.lumMean) / 2;
  const cheekLum = (rois.cheek_left.lumMean + rois.cheek_right.lumMean) / 2;
  const darknessDiff = cheekLum - underEyeLum;
  // 5 → 20 skor, 40+ → 100
  const under_eye_darkness = clamp((darknessDiff - 3) * 3);

  // 7. Acne count — high-edge + high-R spot sayımı approximation (MVP basitleştirme)
  // Edge + redness yüksekse "spot" — kabaca 0-20 aralık
  const acneApprox = Math.round(Math.max(0, (pore_visibility / 100) * (redness / 100) * 30));
  const acne_count = Math.min(50, acneApprox);

  // 8. Fitzpatrick — cheek lum ortalamasına göre 1-6 sınıf
  const overallLum = (rois.cheek_left.lumMean + rois.cheek_right.lumMean + rois.forehead.lumMean) / 3;
  // 200+ → 1 (çok açık), 50- → 6 (çok koyu)
  let fitzpatrick_type = 3;
  if (overallLum >= 200) fitzpatrick_type = 1;
  else if (overallLum >= 175) fitzpatrick_type = 2;
  else if (overallLum >= 145) fitzpatrick_type = 3;
  else if (overallLum >= 115) fitzpatrick_type = 4;
  else if (overallLum >= 85) fitzpatrick_type = 5;
  else fitzpatrick_type = 6;

  // Overall — Faz 1 service ile aynı ağırlıklar
  const overall_score = clamp(
    t_zone_oil * 0.15 +
    pore_visibility * 0.15 +
    wrinkles * 0.20 +
    pigmentation * 0.20 +
    redness * 0.15 +
    under_eye_darkness * 0.15
  );

  return {
    scores: {
      t_zone_oil, pore_visibility, wrinkles, pigmentation,
      redness, under_eye_darkness, acne_count, fitzpatrick_type,
    },
    overall_score,
    model_version: 'on-device-cv-v1',
    rois_extracted: extracted,
  };
}
