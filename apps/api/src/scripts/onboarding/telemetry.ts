/**
 * V2.A.7 — Onboarding telemetry writer.
 *
 * Called once per pipeline run, after all stages finish (success or
 * failure). Uses a dedicated short-lived connection so a failed pipeline
 * transaction can't poison the log insert — the audit trail writes even
 * when the main client is in aborted-transaction state.
 *
 * Silent on write failure: telemetry is observability, not a hard gate.
 * If Neon is down we'd rather finish the pipeline report than mask the
 * real outcome with a DB error.
 */
import type { Client } from 'pg';
import { newClient } from './db';

export type OnboardingLogEntry = {
  product_id: number | null;
  product_slug: string | null;
  started_at: Date;
  completed_at: Date;
  duration_ms: number;
  status: 'success' | 'failed' | 'dry_run';
  failed_stage: string | null;
  error_message: string | null;
  warnings: string[];
  flags: Record<string, unknown>;
};

export async function writeOnboardingLog(entry: OnboardingLogEntry): Promise<void> {
  let c: Client | null = null;
  try {
    c = newClient();
    await c.connect();
    await c.query(
      `INSERT INTO onboarding_log
         (product_id, product_slug, started_at, completed_at, duration_ms,
          status, failed_stage, error_message, warnings, flags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        entry.product_id,
        entry.product_slug,
        entry.started_at.toISOString(),
        entry.completed_at.toISOString(),
        entry.duration_ms,
        entry.status,
        entry.failed_stage,
        entry.error_message ? entry.error_message.slice(0, 2000) : null,
        JSON.stringify(entry.warnings ?? []),
        JSON.stringify(entry.flags ?? {}),
      ],
    );
  } catch (e: any) {
    // Non-fatal: telemetry must not mask the real outcome.
    console.warn(`⚠️  Telemetry write başarısız: ${e?.message ?? e}`);
  } finally {
    if (c) await c.end().catch(() => undefined);
  }
}
