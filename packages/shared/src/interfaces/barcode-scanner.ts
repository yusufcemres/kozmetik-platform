/**
 * IBarcodeScanner — Faz 2.5 Barkod + OCR
 *
 * Mobil uygulamada barkod tarama ve INCI etiketi OCR işlemleri.
 */

export interface BarcodeScanResult {
  barcode: string;
  format: 'EAN_13' | 'EAN_8' | 'UPC_A' | 'UPC_E' | 'CODE_128' | 'QR_CODE' | 'unknown';
  product_id?: number; // DB'de bulunduysa
  matched: boolean;
}

export interface OcrResult {
  raw_text: string;
  confidence: number; // 0-1
  parsed_ingredients: string[]; // INCI parse sonucu
  language_detected: string;
}

export interface IBarcodeScanner {
  /**
   * Barkod tarar ve DB'de eşleşme arar
   */
  scanBarcode(imageData: ArrayBuffer | string): Promise<BarcodeScanResult>;

  /**
   * INCI etiket fotoğrafından OCR + parse
   */
  scanLabel(imageData: ArrayBuffer | string): Promise<OcrResult>;

  /**
   * Barkod DB'de yoksa — admin review queue'ya ekle
   */
  submitUnknownBarcode(params: {
    barcode: string;
    label_image_url?: string;
    ocr_result?: OcrResult;
    reporter_id?: string; // anonymous_id
  }): Promise<{ queued: boolean; message: string }>;
}
