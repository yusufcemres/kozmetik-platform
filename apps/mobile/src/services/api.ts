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
  brand?: { brand_id: number; brand_name: string; brand_slug: string };
  category?: { category_id: number; category_name: string };
  images?: { image_url: string; sort_order: number }[];
  need_scores?: { need_id: number; score: number; need?: { need_name: string } }[];
  affiliate_links?: AffiliateLink[];
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
