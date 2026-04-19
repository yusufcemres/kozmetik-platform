/**
 * V2.B.8 — Pipeline context for the cosmetic onboarding flow.
 *
 * Parallel to context.ts (supplement). Kept in a separate file rather than
 * generic-ifying the supplement context because the payload shapes diverge
 * enough (no supplement_details, different ingredient payload fields) that
 * the generic would pay for itself only if we had a third domain.
 */
import type { Client } from 'pg';
import type { CosmeticOnboardingDocument, CosmeticIngredientPayload } from './validators-cosmetic';
import { StageLogger } from './logger';

export type CosmeticPipelineFlags = {
  dryRun: boolean;
  yes: boolean;
  skipQa: boolean;
  offline: boolean;
};

export type CosmeticResolvedState = {
  brand_id?: number;
  category_id?: number;
  ingredient_ids: Map<string, number>;
  ingredients_to_create: CosmeticIngredientPayload[];
  alias_translations: { input: string; canonical: string }[];
  product_slug?: string;
  image_url?: string;
  affiliate_verification_status?: 'verified' | 'unverified' | 'search_only';
  affiliate_warnings: string[];
  warnings: string[];
};

export type CosmeticPipelinePlan = {
  create_brand: boolean;
  create_category: boolean;
  create_ingredients_count: number;
  summary_lines: string[];
};

export type CosmeticPipelineContext = {
  doc: CosmeticOnboardingDocument;
  client: Client;
  logger: StageLogger;
  flags: CosmeticPipelineFlags;
  resolved: CosmeticResolvedState;
  plan: CosmeticPipelinePlan;
  product_id?: number;
};

export function newCosmeticContext(
  doc: CosmeticOnboardingDocument,
  client: Client,
  flags: CosmeticPipelineFlags,
): CosmeticPipelineContext {
  return {
    doc,
    client,
    logger: new StageLogger(4),
    flags,
    resolved: {
      ingredient_ids: new Map(),
      ingredients_to_create: [],
      alias_translations: [],
      affiliate_warnings: [],
      warnings: [],
    },
    plan: {
      create_brand: false,
      create_category: false,
      create_ingredients_count: 0,
      summary_lines: [],
    },
  };
}

export class CosmeticPipelineError extends Error {
  constructor(public stage: string, message: string) {
    super(`[${stage}] ${message}`);
    this.name = 'CosmeticPipelineError';
  }
}
