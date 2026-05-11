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
  status: 'matched' | 'candidates' | 'unknown' | 'inci_only';
  method: 'barcode' | 'vision' | 'vision_fuzzy' | 'inci_only' | null;
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
    /** OpenBeautyFacts katmanindan gelen alanlar (smart-scan A2) */
    source?: 'vision' | 'openbeautyfacts';
    barcode?: string;
    image_url?: string | null;
    ingredients_list?: string[];
    obf_url?: string;
  };
  scan_id?: number;
  /** Mevcut urune eklenmis yeni INCI sayisi (enrichment). */
  enriched_inci_count?: number;
  /** Fotodan tum INCI'lerin tek tek analizi (inci_only mode + enrichment). */
  inci_analysis?: {
    tokens: Array<{
      rank: number;
      raw: string;
      matched: boolean;
      confidence?: number;
      ingredient?: {
        ingredient_id: number;
        inci_name: string;
        common_name?: string | null;
        ingredient_slug?: string;
        function_summary?: string;
        evidence_grade?: 'A' | 'B' | 'C' | 'D' | 'F' | null;
        allergen_flag?: boolean;
        fragrance_flag?: boolean;
        eu_banned?: boolean;
        cmr_class?: string | null;
      };
    }>;
    summary: {
      total: number;
      matched: number;
      unmatched: number;
      allergens: number;
      fragrances: number;
      cmr: number;
      eu_banned: number;
      kathon: number;
      score: number;
      verdict: 'çok iyi' | 'iyi' | 'orta' | 'riskli' | 'tehlikeli';
    };
  };
};

export async function smartScan(body: {
  barcode?: string;
  image_base64?: string;
  image_mime?: string;
}): Promise<ScanResponse> {
  const token = getUserToken();
  return api.post<ScanResponse>('/smart-scan', body, { token: token ?? undefined });
}
