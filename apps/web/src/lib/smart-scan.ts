import { api } from './api';
import { getUserToken } from './user-auth';

export type ScanCandidate = {
  product_id: number;
  product_slug: string;
  product_name: string;
  brand_name: string;
  similarity: number;
  method: string;
};

export type ScanResponse = {
  status: 'matched' | 'candidates' | 'unknown';
  method: 'barcode' | 'vision' | 'vision_fuzzy' | null;
  confidence: number;
  product?: {
    product_id: number;
    product_slug: string;
    product_name: string;
    brand_name: string;
  };
  candidates?: ScanCandidate[];
  vision_result?: {
    brand: string | null;
    product_name: string | null;
    product_type: string | null;
    detected_text: string | null;
    confidence: number;
  };
  scan_id?: number;
};

export async function smartScan(body: {
  barcode?: string;
  image_base64?: string;
  image_mime?: string;
}): Promise<ScanResponse> {
  const token = getUserToken();
  return api.post<ScanResponse>('/smart-scan', body, { token: token ?? undefined });
}
