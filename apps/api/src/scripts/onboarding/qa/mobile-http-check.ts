/**
 * V2.A.5 — Mobile Expo HTTP QA.
 *
 * The Expo app reads the same Render API that the web does, but via JSON (not
 * HTML). Stage 5 checks /takviyeler/<slug> rendering; this helper covers the
 * three JSON endpoints mobile consumes, so a shape regression (missing field,
 * null-where-required, empty array) is caught at onboarding time instead of by
 * a user screenshot.
 *
 * Endpoints:
 *   GET /products/slug/:slug          → product detail
 *   GET /supplements/:id/score        → score
 *   GET /products/:id/affiliate-links → affiliate
 *
 * Returns a list of assertion failures; caller decides how to surface them.
 * Never throws.
 */
import type { PipelineContext } from '../context';

const API_BASE = process.env.ONBOARDING_API_BASE ?? 'https://kozmetik-api.onrender.com';
const API_PREFIX = '/api/v1';

type Issue = { endpoint: string; message: string };

async function getJson(url: string, timeoutMs = 8000): Promise<{ status: number; body: any }> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } });
    const text = await res.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { _raw: text.slice(0, 120) };
    }
    return { status: res.status, body };
  } catch (e: any) {
    return { status: 0, body: { _error: e?.message ?? String(e) } };
  } finally {
    clearTimeout(t);
  }
}

function assert(
  issues: Issue[],
  endpoint: string,
  cond: boolean,
  message: string,
): void {
  if (!cond) issues.push({ endpoint, message });
}

export async function runMobileHttpCheck(ctx: PipelineContext): Promise<Issue[]> {
  const { logger, resolved, product_id } = ctx;
  const issues: Issue[] = [];

  if (!product_id || !resolved.product_slug) {
    logger.warn(5, 'Mobile QA atlandı — product_id/slug yok.');
    return issues;
  }

  // 1. Product detail by slug (what /takviyeler/<slug> fetches)
  const detailUrl = `${API_BASE}${API_PREFIX}/products/slug/${resolved.product_slug}`;
  const detail = await getJson(detailUrl);
  const detailEp = `GET /products/slug/${resolved.product_slug}`;
  assert(issues, detailEp, detail.status === 200, `HTTP ${detail.status}`);
  if (detail.status === 200) {
    const d = detail.body ?? {};
    assert(issues, detailEp, typeof d.product_id === 'number', 'product_id number değil/yok');
    assert(issues, detailEp, typeof d.product_name === 'string' && d.product_name.length > 0, 'product_name boş');
    assert(issues, detailEp, d.domain_type === 'supplement', `domain_type '${d.domain_type}' — supplement olmalı`);
    assert(issues, detailEp, d.product_id === product_id, `product_id mismatch (${d.product_id} vs ${product_id})`);
  }

  // 2. Supplement score
  const scoreUrl = `${API_BASE}${API_PREFIX}/supplements/${product_id}/score`;
  const score = await getJson(scoreUrl);
  const scoreEp = `GET /supplements/${product_id}/score`;
  assert(issues, scoreEp, score.status === 200, `HTTP ${score.status}`);
  if (score.status === 200) {
    const s = score.body ?? {};
    assert(issues, scoreEp, typeof s.overall_score === 'number', 'overall_score number değil');
    assert(issues, scoreEp, typeof s.grade === 'string' && s.grade.length === 1, 'grade 1-karakter değil');
    assert(issues, scoreEp, s.breakdown && typeof s.breakdown === 'object', 'breakdown object yok');
    assert(issues, scoreEp, Array.isArray(s.explanation), 'explanation array değil');
    assert(issues, scoreEp, s.overall_score > 0, 'overall_score=0 — scoring pipeline sustu');
  }

  // 3. Affiliate links
  const affUrl = `${API_BASE}${API_PREFIX}/products/${product_id}/affiliate-links`;
  const aff = await getJson(affUrl);
  const affEp = `GET /products/${product_id}/affiliate-links`;
  assert(issues, affEp, aff.status === 200, `HTTP ${aff.status}`);
  if (aff.status === 200) {
    assert(issues, affEp, Array.isArray(aff.body), 'response array değil');
    assert(issues, affEp, Array.isArray(aff.body) && aff.body.length >= 1, 'affiliate_link yok — Stage 3 atomic-insert sessizce başarısız olmuş olabilir');
  }

  return issues;
}
