/**
 * Stage 4 — AUTO_SCORING.
 *
 * Obtains an admin JWT (via /api/v1/auth/login with ADMIN_EMAIL/PASSWORD env
 * vars), calls POST /api/v1/admin/supplements/:id/recalculate-score, and
 * asserts the returned score passes sanity checks (>0, grade!='F',
 * floor_cap_applied semantic check).
 *
 * Skips gracefully (warning, not error) if ADMIN_EMAIL/PASSWORD env vars
 * are missing — this keeps Stage 5 available for manual-recalc flows.
 */
import type { PipelineContext } from '../context';
import { PipelineError } from '../context';

const API_BASE = process.env.ONBOARDING_API_BASE ?? 'https://kozmetik-api.onrender.com';

async function fetchAdminToken(): Promise<string | null> {
  const email = process.env.ONBOARDING_ADMIN_EMAIL;
  const password = process.env.ONBOARDING_ADMIN_PASSWORD;
  if (!email || !password) return null;

  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Admin login başarısız (${res.status}): ${body.slice(0, 160)}`);
  }
  const data: any = await res.json();
  return data?.access_token ?? data?.token ?? null;
}

export async function runAutoScoring(ctx: PipelineContext): Promise<void> {
  const { logger } = ctx;
  logger.section('AUTO_SCORING');

  if (!ctx.product_id) {
    throw new PipelineError('Stage 4', 'product_id yok — Stage 3 başarısız mı?');
  }

  let token: string | null = null;
  try {
    token = await fetchAdminToken();
  } catch (e: any) {
    logger.warn(4, `Admin login hatası: ${e?.message ?? e}. Skor recalc atlandı — /admin panel üzerinden manuel recalc gerekli.`);
    return;
  }
  if (!token) {
    logger.warn(
      4,
      'ONBOARDING_ADMIN_EMAIL / ONBOARDING_ADMIN_PASSWORD .env içinde yok. Skor recalc atlandı — /admin panel üzerinden manuel recalc gerekli.',
    );
    return;
  }

  const url = `${API_BASE}/api/v1/admin/supplements/${ctx.product_id}/recalculate-score`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new PipelineError('Stage 4', `Recalc endpoint ${res.status}: ${body.slice(0, 200)}`);
  }
  const score: any = await res.json();
  const overall: number = score?.overall_score ?? score?.score ?? 0;
  const grade: string = score?.grade ?? '—';
  const floorCap: boolean = !!score?.floor_cap_applied;
  const floorReason: string | undefined = score?.floor_cap_reason;

  logger.info(4, `Score: ${overall} (grade=${grade})${floorCap ? ` [floor: ${floorReason ?? '—'}]` : ''}`);

  if (typeof overall === 'number' && overall === 0) {
    throw new PipelineError('Stage 4', 'overall_score=0, muhtemelen ingredient eşleşmedi. Stage 0/1 rerun.');
  }
  if (grade === 'F') {
    throw new PipelineError('Stage 4', `Grade=F (score=${overall}). evidence_grade/food_sources eksik olabilir.`);
  }
  if (floorCap && floorReason === 'UL_EXCEEDED') {
    throw new PipelineError(
      'Stage 4',
      `floor_cap UL_EXCEEDED aktif — elemental_ratio chelated form için eksik olabilir. Stage 1 rerun.`,
    );
  }

  logger.ok(4, `Skor sanity check geçti (score=${overall}, grade=${grade}).`);
}
