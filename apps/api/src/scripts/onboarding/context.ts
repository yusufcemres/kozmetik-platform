/**
 * PipelineContext threaded through every stage. Each stage reads the doc +
 * accumulated state and mutates `resolved` / `plan` in place. Stage 3 uses
 * `plan` as the single source of truth for DB writes.
 */
import type { Client } from 'pg';
import type { OnboardingDocument, IngredientPayload } from './validators';
import { StageLogger } from './logger';

export type PipelineFlags = {
  dryRun: boolean;
  yes: boolean;
  skipQa: boolean;
};

export type ResolvedState = {
  brand_id?: number;
  category_id?: number;
  // slug → ingredient_id for ALL ingredients (existing + newly created payload)
  ingredient_ids: Map<string, number>;
  // slugs that need INSERT in Stage 3
  ingredients_to_create: IngredientPayload[];
  // alias → canonical slug translations we performed (for logging)
  alias_translations: { input: string; canonical: string }[];
  product_slug?: string;
  image_url?: string;
  affiliate_verification_status?: 'verified' | 'unverified' | 'search_only';
  affiliate_warnings: string[];
  warnings: string[];
};

export type PipelinePlan = {
  create_brand: boolean;
  create_category: boolean;
  create_ingredients_count: number;
  // human summary rendered by diff-preview
  summary_lines: string[];
};

export type PipelineContext = {
  doc: OnboardingDocument;
  client: Client;
  logger: StageLogger;
  flags: PipelineFlags;
  resolved: ResolvedState;
  plan: PipelinePlan;
  // populated by Stage 3 post-commit
  product_id?: number;
};

export function newContext(doc: OnboardingDocument, client: Client, flags: PipelineFlags): PipelineContext {
  return {
    doc,
    client,
    logger: new StageLogger(6),
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

export class PipelineError extends Error {
  constructor(public stage: string, message: string) {
    super(`[${stage}] ${message}`);
    this.name = 'PipelineError';
  }
}
