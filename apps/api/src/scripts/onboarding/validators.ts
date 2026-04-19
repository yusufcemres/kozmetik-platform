/**
 * Validators for the supplement onboarding pipeline.
 *
 * Lightweight typed validation (no zod dep) with explicit rule list so fail
 * messages pinpoint the offending field. Each rule prevents a recurring bug
 * from our batch-1..5 seed history — see the "Prevents" comment on each.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type EvidenceCitation = {
  source: string;
  url?: string;
  pmid?: string;
  doi?: string;
  title?: string;
  year?: number;
  accessed?: string;
  opinion_ref?: string;
};

export type FoodSource = {
  food_name: string;
  amount_per_100g: number;
  unit: string;
  bioavailability?: string;
  note?: string;
};

export type IngredientPayload = {
  ingredient_slug: string;
  inci_name: string;
  common_name?: string;
  domain_type?: string;
  function_summary?: string;
  evidence_grade?: 'A' | 'B' | 'C' | 'D' | 'E';
  evidence_citations?: EvidenceCitation[];
  effective_dose_min?: number | null;
  effective_dose_max?: number | null;
  effective_dose_unit?: string | null;
  ul_dose?: number | null;
  elemental_ratio?: number | null;
  form_type?: string | null;
  bioavailability_score?: number | null;
  safety_class?: string | null;
  food_sources?: FoodSource[] | null;
};

export type SupplementIngredientRef = {
  ingredient_slug: string;
  amount_per_serving: number;
  unit: string;
  daily_value_percentage?: number | null;
};

export type ProductPayload = {
  product_name: string;
  brand_slug: string;
  category_slug: string;
  short_description?: string;
  net_content_value?: number;
  net_content_unit?: string;
  supplement_detail: {
    form: string;
    serving_size?: number;
    serving_unit?: string;
    certification?: string;
  };
  ingredients: SupplementIngredientRef[];
  affiliate_url: string;
  affiliate_platform?: string;
  image_url?: string;
};

export type BrandPayload = { brand_slug: string; brand_name: string; country?: string };
export type CategoryPayload = { category_slug: string; category_name: string; domain_type?: string; parent_slug?: string | null };

export type OnboardingDocument = {
  product: ProductPayload;
  ingredients_to_create?: IngredientPayload[];
  brand_to_create?: BrandPayload;
  category_to_create?: CategoryPayload;
};

export type ValidationError = { path: string; message: string };

// ── Constants ────────────────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9-]+$/;
const TURKISH_CHAR_RE = /[çğıöşüÇĞİÖŞÜ]/;
const CHELATED_FORM_RE = /(bisglycinate|gluconate|picolinate|citrate|malate|carbonate|oxide|ascorbate|orotate|fumarate|sulfate|chloride|aspartate|lactate)/i;
const SUPPLEMENT_FORM_ENUM = ['tablet', 'capsule', 'softgel', 'powder', 'liquid', 'gummy', 'spray', 'drop', 'sachet', 'gel', 'syrup'];
const EVIDENCE_GRADES = ['A', 'B', 'C', 'D', 'E'];
const NUTRIENT_GROUPS = new Set(['vitamin', 'mineral', 'amino-acid', 'fatty-acid']);
const TRENDYOL_PRODUCT_RE = /^https:\/\/www\.trendyol\.com\/.*-p-\d+(\?.*)?$/;
const TRENDYOL_SEARCH_RE = /^https:\/\/www\.trendyol\.com\/sr(\?|\/)/;

// ── Core helpers ─────────────────────────────────────────────────────────────

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function looksTurkish(text: string): boolean {
  // Accepts if any Turkish-specific char present, OR text is short enough that
  // loanwords without special chars could still be TR ("vitamin D emilimi").
  // Long text without any TR-specific char is flagged as probably EN.
  if (text.length <= 50) return true;
  return TURKISH_CHAR_RE.test(text);
}

function pushErr(errs: ValidationError[], path: string, message: string): void {
  errs.push({ path, message });
}

// ── Ingredient validation ────────────────────────────────────────────────────

export function validateIngredient(ing: IngredientPayload, idx: number): ValidationError[] {
  const errs: ValidationError[] = [];
  const p = `ingredients_to_create[${idx}]`;

  if (!isNonEmptyString(ing.inci_name) || ing.inci_name.length > 250) {
    pushErr(errs, `${p}.inci_name`, 'Zorunlu, 1-250 karakter.');
  }
  if (!isNonEmptyString(ing.ingredient_slug) || !SLUG_RE.test(ing.ingredient_slug)) {
    pushErr(errs, `${p}.ingredient_slug`, 'Zorunlu, regex: ^[a-z0-9-]+$ (küçük harf + rakam + tire).');
  }
  // Prevents: NULL common_name → UI Latin ad gösterir (batch-1 bug).
  if (!isNonEmptyString(ing.common_name)) {
    pushErr(errs, `${p}.common_name`, 'Zorunlu — boş bırakılırsa UI inci_name gösterir, kullanıcı Latin adını okur.');
  }
  // Prevents: EN function_summary (batch-4: ashwagandha/maca/ginkgo EN metin bug).
  if (!isNonEmptyString(ing.function_summary)) {
    pushErr(errs, `${p}.function_summary`, 'Zorunlu — boşsa sayfa generic placeholder gösterir.');
  } else if (ing.function_summary.length < 80) {
    pushErr(errs, `${p}.function_summary`, `En az 80 karakter gerekli, şu an ${ing.function_summary.length}.`);
  } else if (!looksTurkish(ing.function_summary)) {
    pushErr(errs, `${p}.function_summary`, 'Metin Türkçe görünmüyor (Türkçe karakter yok + >50 char). AI çıktısı kopyalandıysa TR çevir.');
  }
  // Prevents: NULL evidence_grade → score fallback 50 (sessiz).
  if (!ing.evidence_grade || !EVIDENCE_GRADES.includes(ing.evidence_grade)) {
    pushErr(errs, `${p}.evidence_grade`, 'Zorunlu: A|B|C|D|E.');
  }
  if (!Array.isArray(ing.evidence_citations) || ing.evidence_citations.length === 0) {
    pushErr(errs, `${p}.evidence_citations`, 'En az 1 atıf (NIH ODS / Examine / EFSA / PubMed) gerekli.');
  } else {
    ing.evidence_citations.forEach((c, ci) => {
      if (!isNonEmptyString(c?.source)) {
        pushErr(errs, `${p}.evidence_citations[${ci}].source`, 'source zorunlu (örn. NIH_ODS, PubMed, EFSA).');
      }
      if (!c?.url && !c?.pmid && !c?.doi && !c?.opinion_ref) {
        pushErr(errs, `${p}.evidence_citations[${ci}]`, 'url | pmid | doi | opinion_ref alanlarından en az biri gerekli.');
      }
    });
  }

  // Dose range ordering (only enforce if unit given → dose fields active).
  if (ing.effective_dose_unit) {
    if (ing.effective_dose_min == null || ing.effective_dose_max == null) {
      pushErr(errs, `${p}.effective_dose_min/max`, 'unit verildi ama min/max eksik.');
    } else if (Number(ing.effective_dose_min) > Number(ing.effective_dose_max)) {
      pushErr(errs, `${p}.effective_dose`, `min (${ing.effective_dose_min}) > max (${ing.effective_dose_max}).`);
    } else if (ing.ul_dose != null && Number(ing.effective_dose_max) > Number(ing.ul_dose)) {
      pushErr(errs, `${p}.ul_dose`, `UL (${ing.ul_dose}) < effective_dose_max (${ing.effective_dose_max}). Doğrula.`);
    }
  }

  // Prevents: Mg D(50) UL false-positive — chelated form ratio'suz skorlanıyor.
  const isChelated = CHELATED_FORM_RE.test(ing.inci_name ?? '') || CHELATED_FORM_RE.test(ing.ingredient_slug ?? '');
  if (isChelated && (ing.elemental_ratio == null || Number.isNaN(Number(ing.elemental_ratio)))) {
    // Stage 1 enricher will try to auto-fill from lookup; only ERR if still null after enrichment.
    // This helper is called post-enrich, so elemental_ratio must be set by here.
    pushErr(
      errs,
      `${p}.elemental_ratio`,
      'Chelated/compound form (regex match) — elemental_ratio zorunlu. Bilinen 5 formda otomatik set edilir; yeni formda PubChem MW hesapla.',
    );
  }
  if (ing.elemental_ratio != null) {
    const r = Number(ing.elemental_ratio);
    if (Number.isNaN(r) || r <= 0 || r > 1) {
      pushErr(errs, `${p}.elemental_ratio`, 'Ratio 0-1 aralığında olmalı (atomic_weight / molecular_weight).');
    }
  }

  // Prevents: NULL food_sources → "Besin Kaynakları" boş section.
  // Only enforced for nutrient groups (vitamin/mineral/amino-acid/fatty-acid).
  const group = (ing as any).ingredient_group as string | undefined;
  if (group && NUTRIENT_GROUPS.has(group)) {
    if (!Array.isArray(ing.food_sources) || ing.food_sources.length === 0) {
      pushErr(errs, `${p}.food_sources`, `Nutrient group '${group}' — en az 1 food_source girmelisiniz.`);
    }
  }

  return errs;
}

// ── Product validation ───────────────────────────────────────────────────────

export function validateProduct(p: ProductPayload): ValidationError[] {
  const errs: ValidationError[] = [];

  if (!isNonEmptyString(p.product_name)) pushErr(errs, 'product.product_name', 'Zorunlu.');
  if (!isNonEmptyString(p.brand_slug) || !SLUG_RE.test(p.brand_slug)) {
    pushErr(errs, 'product.brand_slug', 'Zorunlu + slug formatı.');
  }
  if (!isNonEmptyString(p.category_slug) || !SLUG_RE.test(p.category_slug)) {
    pushErr(errs, 'product.category_slug', 'Zorunlu + slug formatı.');
  }
  if (!p.supplement_detail || !isNonEmptyString(p.supplement_detail.form)) {
    pushErr(errs, 'product.supplement_detail.form', 'Zorunlu.');
  } else if (!SUPPLEMENT_FORM_ENUM.includes(p.supplement_detail.form)) {
    pushErr(errs, 'product.supplement_detail.form', `Enum: ${SUPPLEMENT_FORM_ENUM.join('|')}.`);
  }
  if (!Array.isArray(p.ingredients) || p.ingredients.length === 0) {
    pushErr(errs, 'product.ingredients', 'En az 1 ingredient gerekli.');
  } else {
    p.ingredients.forEach((ri, i) => {
      if (!isNonEmptyString(ri.ingredient_slug) || !SLUG_RE.test(ri.ingredient_slug)) {
        pushErr(errs, `product.ingredients[${i}].ingredient_slug`, 'Zorunlu + slug formatı.');
      }
      if (typeof ri.amount_per_serving !== 'number' || ri.amount_per_serving <= 0) {
        pushErr(errs, `product.ingredients[${i}].amount_per_serving`, 'Pozitif sayı zorunlu.');
      }
      if (!isNonEmptyString(ri.unit)) {
        pushErr(errs, `product.ingredients[${i}].unit`, 'Zorunlu (mg, mcg, IU, g, B_CFU vs).');
      }
    });
  }
  if (!isNonEmptyString(p.affiliate_url)) {
    pushErr(errs, 'product.affiliate_url', 'Zorunlu.');
  }

  return errs;
}

/**
 * Classify an affiliate URL. Used in Stage 2 to set verification_status
 * without blocking — search URLs are allowed but flagged 'search_only'.
 */
export function classifyAffiliateUrl(url: string, platform = 'trendyol'): {
  verification_status: 'verified' | 'unverified' | 'search_only';
  warning?: string;
} {
  if (platform === 'trendyol') {
    if (TRENDYOL_PRODUCT_RE.test(url)) return { verification_status: 'unverified' };
    if (TRENDYOL_SEARCH_RE.test(url)) {
      return { verification_status: 'search_only', warning: 'Search URL — affiliate revenue kaybı, ürün URL ile değiştir.' };
    }
    return { verification_status: 'unverified', warning: 'Trendyol ürün URL regex eşleşmedi, manuel kontrol et.' };
  }
  return { verification_status: 'unverified' };
}

// ── Top-level validator ──────────────────────────────────────────────────────

export function validateDocument(doc: OnboardingDocument): ValidationError[] {
  const errs: ValidationError[] = [];
  if (!doc || !doc.product) {
    pushErr(errs, 'product', 'product bloğu eksik.');
    return errs;
  }
  errs.push(...validateProduct(doc.product));

  const createdSlugs = new Set((doc.ingredients_to_create ?? []).map((i) => i.ingredient_slug));
  (doc.ingredients_to_create ?? []).forEach((ing, i) => {
    errs.push(...validateIngredient(ing, i));
  });

  // Every product ingredient_slug must be either existing (checked in Stage 0/1
  // against DB) or present in the ingredients_to_create payload.
  // Here we only enforce the payload side — DB lookup is stage-1 responsibility.
  (doc.product?.ingredients ?? []).forEach((ri, i) => {
    if (!createdSlugs.has(ri.ingredient_slug)) {
      // Not necessarily an error — will be resolved via DB lookup in Stage 0/1.
      // Leave a hint entry only if no DB pre-check happened (caller decides).
    }
  });

  return errs;
}

export function formatErrors(errs: ValidationError[]): string {
  if (errs.length === 0) return '0 hata.';
  return errs.map((e, i) => `  ${i + 1}. [${e.path}] ${e.message}`).join('\n');
}

// Exports for reuse in stages
export const _internals = {
  SLUG_RE,
  TURKISH_CHAR_RE,
  CHELATED_FORM_RE,
  SUPPLEMENT_FORM_ENUM,
  EVIDENCE_GRADES,
  NUTRIENT_GROUPS,
  TRENDYOL_PRODUCT_RE,
  TRENDYOL_SEARCH_RE,
  looksTurkish,
};
