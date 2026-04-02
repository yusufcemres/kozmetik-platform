// Types & Enums
export {
  DomainType,
  ProductStatus,
  EffectType,
  EvidenceLevel,
  ContentType,
  ConcentrationBand,
  AdminRole,
  SkinType,
  AffiliatePlatform,
  OriginType,
  DisclosureLevel,
  // Faz 2 — Supplement
  SupplementForm,
  DosageUnit,
  InteractionSeverity,
} from './types/enums';

// Scoring Constants
export {
  BASE_ORDER_SCORES,
  getBaseOrderScore,
  CLAIM_BOOST,
  CONCENTRATION_WEIGHTS,
  RANK_SCORE_WEIGHTS,
  SEARCH_SCORE_WEIGHTS,
  SENSITIVITY_PENALTIES,
} from './constants/scoring';

// Faz 2 Interfaces
export type {
  RoutineStep,
  RoutineInteraction,
  RoutineResult,
  IRoutineEngine,
  BarcodeScanResult,
  OcrResult,
  IBarcodeScanner,
  AffiliatePrice,
  AffiliateLinkParams,
  IAffiliateProvider,
  SyncPayload,
  SyncResult,
  IMobileSyncAdapter,
} from './interfaces';
