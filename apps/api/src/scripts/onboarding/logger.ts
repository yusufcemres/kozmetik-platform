/**
 * Minimal stage logger. Writes to stdout with `[Stage N/5]` prefix so errors
 * are easy to spot when running `ts-node onboard-supplement.ts <json>`.
 */
export class StageLogger {
  constructor(private totalStages = 6) {}

  info(stage: number | string, msg: string): void {
    console.log(`[Stage ${stage}/${this.totalStages}] ${msg}`);
  }

  warn(stage: number | string, msg: string): void {
    console.warn(`[Stage ${stage}/${this.totalStages}] ⚠️  ${msg}`);
  }

  err(stage: number | string, msg: string): void {
    console.error(`[Stage ${stage}/${this.totalStages}] ❌ ${msg}`);
  }

  ok(stage: number | string, msg: string): void {
    console.log(`[Stage ${stage}/${this.totalStages}] ✅ ${msg}`);
  }

  section(title: string): void {
    console.log(`\n───────── ${title} ─────────`);
  }
}
