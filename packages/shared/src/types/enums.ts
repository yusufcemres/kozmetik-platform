// Domain types
export enum DomainType {
  COSMETIC = 'cosmetic',
  SUPPLEMENT = 'supplement',
}

// Product status
export enum ProductStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Effect types for ingredient-need mapping
export enum EffectType {
  DIRECT_SUPPORT = 'direct_support',
  INDIRECT_SUPPORT = 'indirect_support',
  COMPLEMENTARY = 'complementary',
  CAUTION_RELATED = 'caution_related',
}

// Evidence levels
export enum EvidenceLevel {
  SYSTEMATIC_REVIEW = 'systematic_review',
  RANDOMIZED_CONTROLLED = 'randomized_controlled',
  COHORT_STUDY = 'cohort_study',
  CASE_CONTROL = 'case_control',
  EXPERT_OPINION = 'expert_opinion',
  IN_VITRO = 'in_vitro',
  TRADITIONAL_USE = 'traditional_use',
  ANECDOTAL = 'anecdotal',
}

// Content types for articles
export enum ContentType {
  GUIDE = 'guide',
  INGREDIENT_EXPLAINER = 'ingredient_explainer',
  NEED_GUIDE = 'need_guide',
  LABEL_READING = 'label_reading',
  COMPARISON = 'comparison',
  NEWS = 'news',
}

// Concentration bands
export enum ConcentrationBand {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  TRACE = 'trace',
  UNKNOWN = 'unknown',
}

// Admin roles
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  CONTENT_EDITOR = 'content_editor',
  TAXONOMY_EDITOR = 'taxonomy_editor',
  REVIEWER = 'reviewer',
  METHODOLOGY_REVIEWER = 'methodology_reviewer',
}

// Skin types (for user profile)
export enum SkinType {
  OILY = 'oily',
  DRY = 'dry',
  COMBINATION = 'combination',
  NORMAL = 'normal',
  SENSITIVE = 'sensitive',
}

// Affiliate platforms
export enum AffiliatePlatform {
  TRENDYOL = 'trendyol',
  HEPSIBURADA = 'hepsiburada',
  AMAZON_TR = 'amazon_tr',
  DERMOECZANEM = 'dermoeczanem',
  GRATIS = 'gratis',
  OTHER = 'other',
}

// Origin type for ingredients
export enum OriginType {
  SYNTHETIC = 'synthetic',
  NATURAL = 'natural',
  SEMI_SYNTHETIC = 'semi_synthetic',
  BIOTECHNOLOGY = 'biotechnology',
}

// Sponsorship disclosure levels
export enum DisclosureLevel {
  PROMINENT = 'prominent',
  STANDARD = 'standard',
  MINIMAL = 'minimal',
}
