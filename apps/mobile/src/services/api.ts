import axios from 'axios';
import { config } from '../constants/config';

export const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Simple wrapper that unwraps axios response data */
export const apiClient = {
  get: <T = any>(url: string, params?: Record<string, any>): Promise<T> =>
    api.get<T>(url, { params }).then((res: { data: T }) => res.data),

  post: <T = any>(url: string, body?: any): Promise<T> =>
    api.post<T>(url, body).then((res: { data: T }) => res.data),

  put: <T = any>(url: string, body?: any): Promise<T> =>
    api.put<T>(url, body).then((res: { data: T }) => res.data),

  delete: <T = any>(url: string): Promise<T> =>
    api.delete<T>(url).then((res: { data: T }) => res.data),
};

// === Types ===

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  short_description: string;
  product_type_label: string;
  status: string;
  domain_type?: 'cosmetic' | 'supplement' | string;
  brand?: { brand_id: number; brand_name: string; brand_slug: string };
  category?: { category_id: number; category_name: string };
  images?: { image_url: string; sort_order: number }[];
  need_scores?: { need_id: number; score: number; need?: { need_name: string } }[];
  affiliate_links?: AffiliateLink[];
  score?: { overall_score: number; grade: ScoreGrade; algorithm_version: string } | null;
}

export interface Ingredient {
  ingredient_id: number;
  inci_name: string;
  common_name: string;
  ingredient_slug: string;
  ingredient_group: string;
  function_summary: string;
  detailed_description: string;
  evidence_level: string;
  allergen_flag: boolean;
  fragrance_flag: boolean;
}

export interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  description: string;
  icon: string;
}

export interface AffiliateLink {
  affiliate_link_id: number;
  platform: string;
  affiliate_url: string;
  price_snapshot: number | null;
  is_active: boolean;
}

export interface SkinProfile {
  profile_id: number;
  anonymous_id: string;
  skin_type: string;
  concerns: number[];
  sensitivities: {
    fragrance: boolean;
    alcohol: boolean;
    paraben: boolean;
    essential_oils: boolean;
  };
  age_range: string | null;
}

export interface SearchResult {
  type: 'product' | 'ingredient' | 'need';
  id: number;
  name: string;
  slug: string;
  score?: number;
  detail?: string;
}

export interface PersonalScore {
  product_id: number;
  overall_score: number;
  personal_score: number;
  penalties: string[];
}

// === Evidence-based scoring (REVELA v2) ===

export type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ExplanationItem {
  component: string;
  value: number;
  delta: number;
  reason: string;
  citation?: {
    source: string;
    url?: string;
    pmid?: string;
    doi?: string;
    opinion_ref?: string;
    year?: number;
    accessed?: string;
  };
}

export interface SupplementScore {
  product_id: number;
  algorithm_version: string;
  overall_score: number;
  grade: ScoreGrade;
  breakdown: {
    form_quality: number;
    dose_efficacy: number;
    evidence_grade: number;
    third_party_testing: number;
    interaction_safety: number;
    transparency_and_tier: number;
  };
  explanation: ExplanationItem[];
  flags: {
    proprietary_blends: string[];
    ul_exceeded: string[];
    harmful_interactions: string[];
  };
  floor_cap_applied?: string;
  calculated_at: string;
}

export interface CosmeticScore {
  product_id: number;
  algorithm_version: string;
  overall_score: number;
  grade: ScoreGrade;
  breakdown: {
    active_efficacy: number;
    safety_class: number;
    concentration_fit: number;
    interaction_safety: number;
    allergen_load: number;
    cmr_endocrine: number;
    transparency: number;
  };
  explanation: ExplanationItem[];
  flags: {
    allergens: string[];
    fragrances: string[];
    harmful: string[];
    cmr: string[];
    endocrine: string[];
    eu_banned: string[];
  };
  floor_cap_applied?: string;
  calculated_at: string;
}

// === API Functions ===

// Products
export const getProducts = (params?: { page?: number; limit?: number; search?: string }) =>
  api.get<PaginatedResponse<Product>>('/products', { params });

export const getProductBySlug = (slug: string) =>
  api.get<Product>(`/products/${slug}`);

export const getProductAffiliateLinks = (id: number) =>
  api.get<AffiliateLink[]>(`/products/${id}/affiliate-links`);

export const getProductNeedScores = (id: number) =>
  api.get(`/products/${id}/need-scores`);

export const getPersonalScore = (productId: number, profileId: string) =>
  api.get<PersonalScore>(`/products/${productId}/personal-score`, {
    params: { profile_id: profileId },
  });

export const getSupplementScore = (productId: number) =>
  api.get<SupplementScore>(`/supplements/${productId}/score`);

export const getCosmeticScore = (productId: number) =>
  api.get<CosmeticScore>(`/products/${productId}/cosmetic-score`);

// Ingredients
export const getIngredients = (params?: { page?: number; limit?: number; search?: string }) =>
  api.get<PaginatedResponse<Ingredient>>('/ingredients', { params });

export const getIngredientBySlug = (slug: string) =>
  api.get<Ingredient>(`/ingredients/${slug}`);

export const suggestIngredients = (q: string) =>
  api.get('/ingredients/suggest', { params: { q } });

// Needs
export const getNeeds = () =>
  api.get<PaginatedResponse<Need>>('/needs');

export const getNeedBySlug = (slug: string) =>
  api.get<Need>(`/needs/${slug}`);

// Search
export const search = (q: string, type?: string) =>
  api.get<{ results: SearchResult[]; intent: string }>('/search', { params: { q, type } });

export const searchSuggest = (q: string) =>
  api.get<SearchResult[]>('/search/suggest', { params: { q } });

// Skin Profiles
export const createSkinProfile = (data: Omit<SkinProfile, 'profile_id'>) =>
  api.post<SkinProfile>('/skin-profiles', data);

export const getSkinProfile = (anonymousId: string) =>
  api.get<SkinProfile>(`/skin-profiles/${anonymousId}`);

export const updateSkinProfile = (anonymousId: string, data: Partial<SkinProfile>) =>
  api.put<SkinProfile>(`/skin-profiles/${anonymousId}`, data);

// Articles
export const getArticles = (params?: { page?: number; limit?: number }) =>
  api.get('/articles', { params });

export const getArticleBySlug = (slug: string) =>
  api.get(`/articles/${slug}`);
