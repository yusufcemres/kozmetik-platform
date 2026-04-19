/**
 * V2.B.8 — Cosmetic onboarding pipeline — single-file orchestrator.
 *
 * Parallel to onboard-supplement.ts. Four stages (not six): cosmetic has no
 * ingredient-enrichment step (no elemental ratios / bioavailability lookups)
 * and no CosmeticScoring call here — cosmetic scoring is triggered
 * separately via the existing `/admin/products/recalculate-cosmetic-score`
 * bulk job, so we leave product as 'draft' and let that pass over it.
 *
 * Usage:
 *   ts-node onboard-cosmetic.ts <products-queue/brand-product-cosmetic.json> [flags]
 *
 * Flags:
 *   --dry-run  : Stage 2.5'te dur
 *   --yes      : Stage 2.5 interactive onayı atla
 *   --offline  : sadece validator + affiliate classify (CI PR gate)
 */
import * as fs from 'fs';
import * as path from 'path';
import { newClient } from './db';
import {
  classifyAffiliateUrl,
  validateCosmeticDocument,
  type CosmeticOnboardingDocument,
} from './validators-cosmetic';
import { formatErrors } from './validators';
import { newCosmeticContext, CosmeticPipelineError, type CosmeticPipelineFlags } from './context-cosmetic';
import { writeOnboardingLog, type OnboardingLogEntry } from './telemetry';

import { runCosmeticPreflight } from './stages/preflight-cosmetic';
import { runCosmeticProductResearch } from './stages/product-research-cosmetic';
import { runCosmeticDiffPreview } from './stages/diff-preview-cosmetic';
import { runCosmeticAtomicInsert } from './stages/atomic-insert-cosmetic';

function parseFlags(argv: string[]): { jsonPath: string; flags: CosmeticPipelineFlags } {
  const positional = argv.filter((a) => !a.startsWith('--'));
  const jsonPath = positional[0];
  if (!jsonPath) {
    throw new Error('Kullanım: onboard-cosmetic.ts <products-queue/foo.json> [--dry-run] [--yes]');
  }
  return {
    jsonPath: path.resolve(process.cwd(), jsonPath),
    flags: {
      dryRun: argv.includes('--dry-run'),
      yes: argv.includes('--yes'),
      skipQa: argv.includes('--skip-qa'),
      offline: argv.includes('--offline'),
    },
  };
}

function runOfflineGate(doc: CosmeticOnboardingDocument): void {
  console.log(`\n🛡️  OFFLINE mode — DB/network atlandı, sadece pure gate.\n`);
  console.log(`  [validator] ✓ ${doc.ingredients_to_create?.length ?? 0} ingredient payload + product shape`);
  const cls = classifyAffiliateUrl(doc.product.affiliate_url, doc.product.affiliate_platform);
  const tag = cls.verification_status === 'verified' ? '✓' : cls.verification_status === 'unverified' ? '~' : '⚠';
  console.log(`  [affiliate] ${tag} status=${cls.verification_status}${cls.warning ? ` — ${cls.warning}` : ''}`);
  console.log(`\n✅ Offline gate passed.`);
}

function loadDocument(p: string): CosmeticOnboardingDocument {
  if (!fs.existsSync(p)) throw new Error(`JSON bulunamadı: ${p}`);
  const raw = fs.readFileSync(p, 'utf-8');
  try {
    return JSON.parse(raw) as CosmeticOnboardingDocument;
  } catch (e: any) {
    throw new Error(`JSON parse hatası: ${e.message}`);
  }
}

async function main(): Promise<void> {
  const { jsonPath, flags } = parseFlags(process.argv.slice(2));
  console.log(`\n💄 Cosmetic Onboarding Pipeline`);
  console.log(`   input: ${jsonPath}`);
  console.log(`   mode : ${flags.offline ? 'OFFLINE' : flags.dryRun ? 'DRY-RUN' : 'LIVE'}${flags.yes ? ' --yes' : ''}\n`);

  const doc = loadDocument(jsonPath);

  const staticErrs = validateCosmeticDocument(doc);
  if (staticErrs.length > 0) {
    console.error(`❌ Static validation FAIL (${staticErrs.length} hata):\n${formatErrors(staticErrs)}`);
    process.exit(1);
  }

  if (flags.offline) {
    runOfflineGate(doc);
    return;
  }

  const client = newClient();
  await client.connect();
  const ctx = newCosmeticContext(doc, client, flags);

  const startedAt = new Date();
  const t0 = Date.now();
  let telemetryStatus: 'success' | 'failed' | 'dry_run' = 'success';
  let failedStage: string | null = null;
  let errorMessage: string | null = null;

  try {
    await runCosmeticPreflight(ctx);
    await runCosmeticProductResearch(ctx);

    const shouldProceed = await runCosmeticDiffPreview(ctx);
    if (!shouldProceed) {
      console.log("\n👋 Durduruldu (dry-run veya onay reddi). DB'ye yazılmadı.");
      telemetryStatus = 'dry_run';
      return;
    }

    await runCosmeticAtomicInsert(ctx);

    console.log(
      `\n✅ Cosmetic product ${ctx.product_id} onboarded (status='draft').` +
        `\n   Skorlama için: pnpm tsx scripts/recalc-cosmetic-scores.ts --product-id=${ctx.product_id}`,
    );
  } catch (e: any) {
    telemetryStatus = 'failed';
    if (e instanceof CosmeticPipelineError) {
      failedStage = e.stage;
      errorMessage = e.message;
      console.error(`\n❌ ${e.message}`);
    } else {
      errorMessage = e?.message ?? String(e);
      console.error(`\n❌ Beklenmeyen hata: ${e?.stack ?? e?.message ?? e}`);
    }
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);

    const entry: OnboardingLogEntry = {
      product_id: ctx.product_id ?? null,
      product_slug: ctx.resolved.product_slug ?? doc.product.product_name ?? null,
      started_at: startedAt,
      completed_at: new Date(),
      duration_ms: Date.now() - t0,
      status: telemetryStatus,
      failed_stage: failedStage,
      error_message: errorMessage,
      warnings: ctx.resolved.warnings ?? [],
      flags: { ...flags, domain: 'cosmetic' },
    };
    await writeOnboardingLog(entry);
  }
}

main().catch((e) => {
  console.error(e?.stack ?? e?.message ?? e);
  process.exit(1);
});
