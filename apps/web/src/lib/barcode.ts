'use client';

/**
 * Barcode detection: BarcodeDetector API (native, fast) → @zxing/browser fallback.
 */

type BarcodeResult = { rawValue: string; format: string };

export async function detectBarcodeFromBlob(blob: Blob): Promise<BarcodeResult | null> {
  // Native API (Chrome Android, Samsung, Edge)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      // @ts-expect-error - BarcodeDetector is not in TS lib
      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
      });
      const bitmap = await createImageBitmap(blob);
      const codes = await detector.detect(bitmap);
      if (codes.length > 0) {
        return { rawValue: codes[0].rawValue, format: codes[0].format };
      }
    } catch (err) {
      console.warn('BarcodeDetector failed, falling back to zxing:', err);
    }
  }

  // Fallback: @zxing/browser
  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser');
    const reader = new BrowserMultiFormatReader();
    const url = URL.createObjectURL(blob);
    try {
      const result = await reader.decodeFromImageUrl(url);
      return { rawValue: result.getText(), format: result.getBarcodeFormat().toString() };
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null;
  }
}

export async function detectBarcodeFromVideo(video: HTMLVideoElement): Promise<BarcodeResult | null> {
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      // @ts-expect-error
      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
      });
      const codes = await detector.detect(video);
      if (codes.length > 0) {
        return { rawValue: codes[0].rawValue, format: codes[0].format };
      }
    } catch {
      // fall through
    }
  }
  return null;
}

export function captureVideoFrame(video: HTMLVideoElement, mime = 'image/jpeg', quality = 0.8): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    // Downscale for faster upload
    const maxW = 1280;
    const scale = Math.min(1, maxW / video.videoWidth);
    canvas.width = Math.floor(video.videoWidth * scale);
    canvas.height = Math.floor(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(null);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((b) => resolve(b), mime, quality);
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip "data:image/jpeg;base64," prefix
      const base64 = result.split(',')[1] ?? result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
