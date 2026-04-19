/**
 * V2.B.8 — Validators for the cosmetic onboarding pipeline.
 *
 * Parallel to validators.ts (supplement). Same lightweight rule-list style,
 * but the required-field set is different: cosmetic needs cir_status,
 * cmr_class, safety_class, efficacy_conc_min/max, concentration_percent on
 * the product_ingredient join — not elemental_ratio / UL / evidence_grade.
 *
 * Rules were picked to prevent the most common CIR/SCCS regression: a new
 * ingredient landing without a safety review flag or without a concentration
 * window, which silently tanks CosmeticScoringService's active_efficacy and
 * concentration_fit components.
 */

import { classifyAffiliateUrl, type ValidationError } from './validators';

// ── Types ────────────────────────────────────────────────────────────────────

// CIR = Cosmetic Ingredient Review board status (US industry body).
export type CirStatus = 'safe' | 'safe_with_conditions' | 'insufficient_data' | 'unsafe' | 'not_reviewed';

// CMR = Carcinogen / Mutagen / Reproductive toxin classification (EU CLP).
export type CmrClass = '1A' | '1B' | '2' | 'none';

// IARC = International Agency for Research on Cancer carcinogen group.
export type IarcGroup = '1' | '2A' | '2B' | '3' | '4' | 'none';

export type SafetyClass = 'safe' | 'neutral' | 'caution' | 'restricted';

export type CosmeticIngredientPayload = {
  ingredient_slug: string;
  inci_name: string;
  common_name?: string;
  ingredient_group?: string; // e.g. 'active', 'surfactant', 'emollient', 'preservative'
  function_summary?: string;

  // Cosmetic-only safety dossier fields
  cir_status?: CirStatus;
  sccs_opinion_ref?: string | null;
  cmr_class?: CmrClass;
  iarc_group?: IarcGroup;
  safety_class?: SafetyClass;

  // Concentration window (% of formulation). Required for 'active' group —
  // CosmeticScoringService.concentration_fit reads these to score efficacy.
  efficacy_conc_min?: number | null;
  efficacy_conc_max?: number | null;
  eu_annex_iii_limit?: number | null; // EU restricted max %

  // Regulatory flags — default false
  endocrine_flag?: boolean;
  eu_banned?: boolean;
  eu_restricted?: boolean;
  allergen_flag?: boolean;
  fragrance_flag?: boolean;
  preservative_flag?: boolean;

  // Optional narrative (for UI)
  sensitivity_note?: string | null;
  safety_note?: string | null;
};

// product_ingredients.inci_order_rank + concentration_percent matter here.
export type CosmeticIngredientRef = {
  ingredient_slug: string;
  inci_order_rank: number; // 1-based, per INCI-list order on the label
  concentration_percent?: number | null; // optional; required for 'active' if declared
  is_highlighted_in_claims?: boolean;
};

export type CosmeticProductPayload = {
  product_name: string;
  brand_slug: string;
  category_slug: string;
  short_description?: string;
  net_content_value?: number;
  net_content_unit?: string;

  // Cosmetic-only product columns
  product_type_label?: string; // e.g. 'serum', 'moisturizer', 'cleanser'
  target_area?: string; // 'face' | 'body' | 'hair' | 'eye' | ...
  usage_time_hint?: string; // 'morning' | 'evening' | 'both'
  target_gender?: string | null;

  ingredients: CosmeticIngredientRef[];
  affiliate_url: string;
  affiliate_platform?: string;
  image_url?: string;
};

export type CosmeticBrandPayload = { brand_slug: string; brand_name: string; country?: string };
export type CosmeticCategoryPayload = {
  category_slug: string;
  category_name: string;
  parent_slug?: string | null;
};

export type CosmeticOnboardingDocument = {
  product: CosmeticProductPayload;
  ingredients_to_create?: CosmeticIngredientPayload[];
  brand_to_create?: CosmeticBrandPayload;
  category_to_create?: CosmeticCategoryPayload;
};

// ── Constants ────────────────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9-]+$/;
const TURKISH_CHAR_RE = /[çğıöşüÇĞİÖŞÜ]/;
const PRODUCT_TYPE_ENUM = [
  'serum', 'moisturizer', 'cleanser', 'toner', 'sunscreen',
  'cream', 'gel', 'mask', 'essence', 'exfoliant', 'oil',
  'balm', 'lotion', 'spray', 'shampoo', 'conditioner',
];
const CIR_STATUS_ENUM: CirStatus[] = ['safe', 'safe_with_conditions', 'insufficient_data', 'unsafe', 'not_reviewed'];
const CMR_CLASS_ENUM: CmrClass[] = ['1A', '1B', '2', 'none'];
const IARC_GROUP_ENUM: IarcGroup[] = ['1', '2A', '2B', '3', '4', 'none'];
const SAFETY_CLASS_ENUM: SafetyClass[] = ['safe', 'neutral', 'caution', 'restricted'];
const TARGET_AREA_ENUM = ['face', 'body', 'hair', 'eye', 'lip', 'hand', 'foot', 'scalp'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function looksTurkish(text: string): boolean {
  if (text.length <= 50) return true;
  return TURKISH_CHAR_RE.test(text);
}

function pushErr(errs: ValidationError[], path: string, message: string): void {
  errs.push({ path, message });
}

// ── Ingredient validation ────────────────────────────────────────────────────

export function validateCosmeticIngredient(ing: CosmeticIngredientPayload, idx: number): ValidationError[] {
  const errs: ValidationError[] = [];
  const p = `ingredients_to_create[${idx}]`;

  if (!isNonEmptyString(ing.inci_name) || ing.inci_name.length > 250) {
    pushErr(errs, `${p}.inci_name`, 'Zorunlu, 1-250 karakter.');
  }
  if (!isNonEmptyString(ing.ingredient_slug) || !SLUG_RE.test(ing.ingredient_slug)) {
    pushErr(errs, `${p}.ingredient_slug`, 'Zorunlu, regex: ^[a-z0-9-]+$.');
  }
  // Prevents: UI gösterirken INCI Latin adı okur. Supplement'teki aynı bug.
  if (!isNonEmptyString(ing.common_name)) {
    pushErr(errs, `${p}.common_name`, 'Zorunlu — boşsa UI INCI adını gösterir.');
  }
  if (!isNonEmptyString(ing.function_summary)) {
    pushErr(errs, `${p}.function_summary`, 'Zorunlu — boşsa sayfa generic placeholder gösterir.');
  } else if (ing.function_summary.length < 60) {
    // Cosmetic summaries are shorter than supplement (60 vs 80) — ingredient
    // behavior in cosmetic context is simpler to describe than dose-dependent
    // supplement mechanisms.
    pushErr(errs, `${p}.function_summary`, `En az 60 karakter, şu an ${ing.function_summary.length}.`);
  } else if (!looksTurkish(ing.function_summary)) {
    pushErr(errs, `${p}.function_summary`, 'Metin TR görünmüyor. AI çıktısı kopyalandıysa çevir.');
  }

  // Cosmetic safety dossier — required fields
  if (!ing.cir_status || !CIR_STATUS_ENUM.includes(ing.cir_status)) {
    pushErr(errs, `${p}.cir_status`, `Zorunlu. Enum: ${CIR_STATUS_ENUM.join('|')}.`);
  }
  if (!ing.cmr_class || !CMR_CLASS_ENUM.includes(ing.cmr_class)) {
    pushErr(errs, `${p}.cmr_class`, `Zorunlu. Enum: ${CMR_CLASS_ENUM.join('|')}.`);
  }
  if (!ing.safety_class || !SAFETY_CLASS_ENUM.includes(ing.safety_class)) {
    pushErr(errs, `${p}.safety_class`, `Zorunlu. Enum: ${SAFETY_CLASS_ENUM.join('|')}.`);
  }
  if (ing.iarc_group != null && !IARC_GROUP_ENUM.includes(ing.iarc_group)) {
    pushErr(errs, `${p}.iarc_group`, `Enum: ${IARC_GROUP_ENUM.join('|')}.`);
  }

  // Active group → concentration window required.
  if (ing.ingredient_group === 'active') {
    if (ing.efficacy_conc_min == null || ing.efficacy_conc_max == null) {
      pushErr(
        errs,
        `${p}.efficacy_conc_min/max`,
        "ingredient_group='active' için efficacy_conc_min ve max zorunlu (concentration_fit bu değerleri okur).",
      );
    } else if (Number(ing.efficacy_conc_min) > Number(ing.efficacy_conc_max)) {
      pushErr(errs, `${p}.efficacy_conc`, `min (${ing.efficacy_conc_min}) > max (${ing.efficacy_conc_max}).`);
    }
  }

  // EU regulatory guardrails
  if (ing.eu_banned) {
    pushErr(
      errs,
      `${p}.eu_banned`,
      "eu_banned=true — AB'de yasaklı ingredient, onboarding durdurdu. Farklı ingredient kullan veya kaydı iptal et.",
    );
  }
  if (ing.eu_annex_iii_limit != null) {
    const v = Number(ing.eu_annex_iii_limit);
    if (Number.isNaN(v) || v < 0 || v > 100) {
      pushErr(errs, `${p}.eu_annex_iii_limit`, '% cinsinden 0-100 aralığında sayı bekleniyor.');
    }
    // If active + annex limit declared, max should not exceed the limit.
    if (ing.efficacy_conc_max != null && Number(ing.efficacy_conc_max) > v) {
      pushErr(
        errs,
        `${p}.efficacy_conc_max`,
        `max (${ing.efficacy_conc_max}%) > EU Annex III limiti (${v}%). Doğrula.`,
      );
    }
  }

  return errs;
}

// ── Product validation ───────────────────────────────────────────────────────

export function validateCosmeticProduct(p: CosmeticProductPayload): ValidationError[] {
  const errs: ValidationError[] = [];

  if (!isNonEmptyString(p.product_name)) pushErr(errs, 'product.product_name', 'Zorunlu.');
  if (!isNonEmptyString(p.brand_slug) || !SLUG_RE.test(p.brand_slug)) {
    pushErr(errs, 'product.brand_slug', 'Zorunlu + slug formatı.');
  }
  if (!isNonEmptyString(p.category_slug) || !SLUG_RE.test(p.category_slug)) {
    pushErr(errs, 'product.category_slug', 'Zorunlu + slug formatı.');
  }
  if (p.product_type_label != null && !PRODUCT_TYPE_ENUM.includes(p.product_type_label)) {
    pushErr(errs, 'product.product_type_label', `Enum: ${PRODUCT_TYPE_ENUM.join('|')}.`);
  }
  if (p.target_area != null && !TARGET_AREA_ENUM.includes(p.target_area)) {
    pushErr(errs, 'product.target_area', `Enum: ${TARGET_AREA_ENUM.join('|')}.`);
  }
  if (!Array.isArray(p.ingredients) || p.ingredients.length === 0) {
    pushErr(errs, 'product.ingredients', 'En az 1 ingredient gerekli.');
  } else {
    // inci_order_rank: unique positive integers. NOT required to be dense —
    // real cosmetic labels have 15-30 ingredients and we record only the
    // notable ones (e.g. actives at positions 2 and 5).
    const ranks = p.ingredients.map((x) => Number(x.inci_order_rank));
    const seen = new Set<number>();
    for (const r of ranks) {
      if (seen.has(r)) {
        pushErr(errs, 'product.ingredients', `inci_order_rank tekrar eden değer: ${r} (benzersiz olmalı).`);
        break;
      }
      seen.add(r);
    }
    p.ingredients.forEach((ri, i) => {
      if (!isNonEmptyString(ri.ingredient_slug) || !SLUG_RE.test(ri.ingredient_slug)) {
        pushErr(errs, `product.ingredients[${i}].ingredient_slug`, 'Zorunlu + slug formatı.');
      }
      if (!Number.isInteger(ri.inci_order_rank) || ri.inci_order_rank < 1) {
        pushErr(errs, `product.ingredients[${i}].inci_order_rank`, 'Pozitif tamsayı zorunlu (1-based).');
      }
      if (ri.concentration_percent != null) {
        const v = Number(ri.concentration_percent);
        if (Number.isNaN(v) || v <= 0 || v > 100) {
          pushErr(errs, `product.ingredients[${i}].concentration_percent`, '0-100 aralığında sayı bekleniyor.');
        }
      }
    });
  }
  if (!isNonEmptyString(p.affiliate_url)) {
    pushErr(errs, 'product.affiliate_url', 'Zorunlu.');
  }

  return errs;
}

// ── Top-level validator ──────────────────────────────────────────────────────

export function validateCosmeticDocument(doc: CosmeticOnboardingDocument): ValidationError[] {
  const errs: ValidationError[] = [];
  if (!doc || !doc.product) {
    pushErr(errs, 'product', 'product bloğu eksik.');
    return errs;
  }
  errs.push(...validateCosmeticProduct(doc.product));
  (doc.ingredients_to_create ?? []).forEach((ing, i) => {
    errs.push(...validateCosmeticIngredient(ing, i));
  });
  return errs;
}

// Re-export affiliate classifier — identical between domains.
export { classifyAffiliateUrl };

export const _internals = {
  SLUG_RE,
  PRODUCT_TYPE_ENUM,
  CIR_STATUS_ENUM,
  CMR_CLASS_ENUM,
  IARC_GROUP_ENUM,
  SAFETY_CLASS_ENUM,
  TARGET_AREA_ENUM,
};
