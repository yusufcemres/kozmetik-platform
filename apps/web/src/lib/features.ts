/**
 * Faz P — Feature flags.
 * Gradual rollout için default false; test sonrası env'den aç.
 */
export type FeatureKey =
  | 'ai_search'
  | 'quiz_v2'
  | 'blog'
  | 'compare'
  | 'medical_reviewers'
  | 'titck_badge'
  | 'cross_sell';

const defaults: Record<FeatureKey, boolean> = {
  ai_search: true,
  quiz_v2: true,
  blog: true,
  compare: false,
  medical_reviewers: true,
  titck_badge: true,
  cross_sell: true,
};

function readEnv(key: FeatureKey): boolean {
  const envKey = `NEXT_PUBLIC_FEATURE_${key.toUpperCase()}`;
  const val = (process.env as Record<string, string | undefined>)[envKey];
  if (val == null) return defaults[key];
  return val === '1' || val.toLowerCase() === 'true';
}

export function isEnabled(key: FeatureKey): boolean {
  return readEnv(key);
}

export const features = {
  get ai_search() { return isEnabled('ai_search'); },
  get quiz_v2() { return isEnabled('quiz_v2'); },
  get blog() { return isEnabled('blog'); },
  get compare() { return isEnabled('compare'); },
  get medical_reviewers() { return isEnabled('medical_reviewers'); },
  get titck_badge() { return isEnabled('titck_badge'); },
  get cross_sell() { return isEnabled('cross_sell'); },
};
