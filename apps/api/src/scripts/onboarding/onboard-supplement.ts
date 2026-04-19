/**
 * Supplement onboarding pipeline — single-file orchestrator.
 *
 * Usage:
 *   ts-node onboard-supplement.ts <products-queue/brand-product.json> [flags]
 *
 * Flags:
 *   --dry-run     : Stage 2.5'te dur (diff göster), DB'ye dokunma
 *   --yes         : Stage 2.5'te interactive onay sor**ma**, direkt Stage 3
 *   --skip-qa     : Stage 5 atla (CI için)
 *   --offline     : DB/network yok — sadece pure validator + elemental-detect
 *                   + affiliate URL classify koşar. CI PR-gate için.
 *   --batch <dir> : (future) Sıralı tüm *.json'ları işle
 *
 * Each stage is in ./stages/*.ts and receives the shared PipelineContext.
 * Stages throw PipelineError on fatal issues → orchestrator catches, prints,
 * exits non-zero. Validation errors get a dedicated pretty-printer.
 */
import * as fs from 'fs';
import * as path from 'path';
import { newClient } from './db';
import { classifyAffiliateUrl, formatErrors, validateDocument } from './validators';
import type { OnboardingDocument } from './validators';
import { newContext, PipelineError, type PipelineFlags } from './context';
import { detectElementalRatio } from './enrichers/elemental-detect';

import { runPreflight } from './stages/preflight';
import { runIngredientEnrich } from './stages/ingredient-enrich';
import { runProductResearch } from './stages/product-research';
import { runDiffPreview } from './stages/diff-preview';
import { runAtomicInsert } from './stages/atomic-insert';
import { runAutoScoring } from './stages/auto-scoring';
import { runVercelQa } from './stages/vercel-qa';

function parseFlags(argv: string[]): { jsonPath: string; flags: PipelineFlags } {
  const positional = argv.filter((a) => !a.startsWith('--'));
  const jsonPath = positional[0];
  if (!jsonPath) {
    throw new Error('Kullanım: onboard-supplement.ts <products-queue/foo.json> [--dry-run] [--yes] [--skip-qa]');
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

/**
 * Offline gate: runs pure checks only (validator + elemental-detect + affiliate
 * classify). Used by CI on PRs touching products-queue/*.json — no DB, no HTTP.
 * Exits 1 if any rule fails.
 */
function runOfflineGate(doc: OnboardingDocument): void {
  console.log(`\n🛡️  OFFLINE mode — DB/network atlandı, sadece pure gate.\n`);

  // 1) Static validator (already run before this func — we just log success)
  console.log(`  [validator] ✓ ${doc.ingredients_to_create?.length ?? 0} ingredient payload + product shape`);

  // 2) Elemental-ratio enrichment check for each new ingredient
  let elementalMissing = 0;
  for (const ing of doc.ingredients_to_create ?? []) {
    const res = detectElementalRatio(ing);
    if (res.action === 'missing') {
      console.error(`  [elemental] ✗ ${ing.ingredient_slug}: ${res.reason}`);
      elementalMissing++;
    } else if (res.action === 'kept') {
      console.log(`  [elemental] ✓ ${ing.ingredient_slug}: ratio=${res.ratio} (${res.source})`);
    } else {
      console.log(`  [elemental] – ${ing.ingredient_slug}: ${res.reason}`);
    }
  }

  // 3) Affiliate URL classification
  const cls = classifyAffiliateUrl(doc.product.affiliate_url, doc.product.affiliate_platform);
  const tag = cls.verification_status === 'verified' ? '✓' : cls.verification_status === 'unverified' ? '~' : '⚠';
  console.log(`  [affiliate] ${tag} status=${cls.verification_status}${cls.warning ? ` — ${cls.warning}` : ''}`);

  if (elementalMissing > 0) {
    console.error(`\n❌ Offline gate FAIL: ${elementalMissing} ingredient chelated ama elemental_ratio yok.`);
    process.exit(1);
  }
  console.log(`\n✅ Offline gate passed.`);
}

function loadDocument(p: string): OnboardingDocument {
  if (!fs.existsSync(p)) throw new Error(`JSON bulunamadı: ${p}`);
  const raw = fs.readFileSync(p, 'utf-8');
  try {
    return JSON.parse(raw) as OnboardingDocument;
  } catch (e: any) {
    throw new Error(`JSON parse hatası: ${e.message}`);
  }
}

async function main(): Promise<void> {
  const { jsonPath, flags } = parseFlags(process.argv.slice(2));
  console.log(`\n🧪 Supplement Onboarding Pipeline`);
  console.log(`   input: ${jsonPath}`);
  console.log(`   mode : ${flags.offline ? 'OFFLINE' : flags.dryRun ? 'DRY-RUN' : 'LIVE'}${flags.yes ? ' --yes' : ''}${flags.skipQa ? ' --skip-qa' : ''}\n`);

  const doc = loadDocument(jsonPath);

  // Pre-stage static validation — doesn't need DB.
  const staticErrs = validateDocument(doc);
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
  const ctx = newContext(doc, client, flags);

  try {
    await runPreflight(ctx);
    await runIngredientEnrich(ctx);
    await runProductResearch(ctx);

    // Stage 2.5 — renders diff, handles --dry-run and interactive --yes gate.
    const shouldProceed = await runDiffPreview(ctx);
    if (!shouldProceed) {
      console.log("\n👋 Durduruldu (dry-run veya onay reddi). DB'ye yazılmadı.");
      return;
    }

    await runAtomicInsert(ctx);
    await runAutoScoring(ctx);
    if (!flags.skipQa) {
      await runVercelQa(ctx);
    } else {
      ctx.logger.warn(5, 'Vercel QA atlandı (--skip-qa).');
    }

    console.log(`\n✅ Product ${ctx.product_id} onboarded.`);
  } catch (e: any) {
    if (e instanceof PipelineError) {
      console.error(`\n❌ ${e.message}`);
    } else {
      console.error(`\n❌ Beklenmeyen hata: ${e?.stack ?? e?.message ?? e}`);
    }
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((e) => {
  console.error(e?.stack ?? e?.message ?? e);
  process.exit(1);
});
