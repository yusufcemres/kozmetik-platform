/**
 * Stage 5 — VERCEL_QA.
 *
 * Post-deploy HTML check on /takviyeler/<slug>. Runs checklist:
 *   1. Page returns HTTP 200.
 *   2. Page contains the ingredient function_summary (first 30 chars).
 *   3. Page does NOT contain the generic placeholder text
 *      "Aktif madde, hedefe yönelik bakım etkisi" (NULL common_name bug).
 *   4. Score badge rendered (loose heuristic: 'Skor' or 'Grade' present).
 *
 * Retries once after 5s (revalidate may not have fired yet).
 */
import type { PipelineContext } from '../context';
import { runMobileHttpCheck } from '../qa/mobile-http-check';

const VERCEL_BASE = process.env.ONBOARDING_WEB_BASE ?? 'https://kozmetik-platform.vercel.app';
const GENERIC_PLACEHOLDER = 'Aktif madde, hedefe yönelik bakım etkisi';

export async function runVercelQa(ctx: PipelineContext): Promise<void> {
  const { logger, doc, resolved, client } = ctx;
  logger.section('VERCEL_QA');

  const slug = resolved.product_slug;
  if (!slug) {
    logger.warn(5, 'product_slug yok, QA atlandı.');
    return;
  }

  const url = `${VERCEL_BASE}/takviyeler/${slug}`;
  logger.info(5, `Checking: ${url}`);

  // Find a representative function_summary to match on: prefer a newly created
  // ingredient, fallback to the first product ingredient's DB row.
  let probeSnippet = '';
  if (resolved.ingredients_to_create[0]?.function_summary) {
    probeSnippet = resolved.ingredients_to_create[0].function_summary.slice(0, 30);
  } else {
    const firstSlug = doc.product.ingredients[0]?.ingredient_slug;
    if (firstSlug) {
      const r = await client.query(
        `SELECT function_summary FROM ingredients WHERE ingredient_slug=$1`,
        [firstSlug],
      );
      probeSnippet = (r.rows[0]?.function_summary ?? '').slice(0, 30);
    }
  }

  const attempt = async (): Promise<{ ok: boolean; body: string; status: number }> => {
    try {
      const res = await fetch(url);
      const body = await res.text();
      return { ok: res.ok, body, status: res.status };
    } catch (e: any) {
      return { ok: false, body: String(e?.message ?? e), status: 0 };
    }
  };

  let r = await attempt();
  if (r.status !== 200) {
    logger.info(5, `Status=${r.status}, 5sn bekleyip tekrar deneniyor...`);
    await new Promise((res) => setTimeout(res, 5000));
    r = await attempt();
  }

  const issues: string[] = [];
  if (r.status !== 200) issues.push(`HTTP ${r.status}`);

  if (probeSnippet && !r.body.includes(probeSnippet)) {
    issues.push(`function_summary snippet sayfada yok: "${probeSnippet}"`);
  }
  if (r.body.includes(GENERIC_PLACEHOLDER)) {
    issues.push(`Generic placeholder render ediyor → common_name / function_summary eksik.`);
  }
  if (!/Skor|skor|Grade|grade/.test(r.body)) {
    issues.push('Skor/Grade rozeti bulunamadı.');
  }

  if (issues.length > 0) {
    logger.warn(5, `QA checklist ${issues.length} uyarı:\n  - ${issues.join('\n  - ')}`);
    logger.warn(5, '⚠️  İlk deploy döngüsünde bu normal. 5 dk sonra tekrar kontrol et.');
  } else {
    logger.ok(5, 'Vercel page QA tamam.');
  }

  // Mobile HTTP shape check — same data the Expo app consumes.
  logger.info(5, 'Mobile API shape check...');
  const mobileIssues = await runMobileHttpCheck(ctx);
  if (mobileIssues.length > 0) {
    const lines = mobileIssues.map((i) => `${i.endpoint}: ${i.message}`).join('\n  - ');
    logger.warn(5, `Mobile HTTP QA ${mobileIssues.length} hata:\n  - ${lines}`);
  } else {
    logger.ok(5, 'Mobile HTTP QA tamam (3 endpoint assertion geçti).');
  }
}
