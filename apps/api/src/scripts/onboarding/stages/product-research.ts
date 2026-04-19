/**
 * Stage 2 — PRODUCT_RESEARCH.
 *
 * Fills missing product metadata that doesn't require human judgment:
 *  - image_url (Tavily Extract fallback)
 *  - affiliate_url classification (verified/unverified/search_only)
 *  - HEAD check on image_url (basic dead-link detection)
 *
 * Never blocks — warnings accumulate in ctx.resolved and are shown in Stage 2.5.
 */
import type { PipelineContext } from '../context';
import { classifyAffiliateUrl } from '../validators';
import { fetchProductImageViaTavily } from '../enrichers/tavily-image';

async function headCheck(url: string, timeoutMs = 5000): Promise<number> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch(url, { method: 'HEAD', signal: ctl.signal });
    clearTimeout(t);
    return res.status;
  } catch {
    return 0;
  }
}

export async function runProductResearch(ctx: PipelineContext): Promise<void> {
  const { doc, resolved, logger } = ctx;
  logger.section('PRODUCT_RESEARCH');

  // Affiliate URL classification
  const { verification_status, warning } = classifyAffiliateUrl(
    doc.product.affiliate_url,
    doc.product.affiliate_platform ?? 'trendyol',
  );
  resolved.affiliate_verification_status = verification_status;
  if (warning) {
    resolved.affiliate_warnings.push(warning);
    logger.warn(2, `affiliate: ${warning}`);
  } else {
    logger.ok(2, `affiliate: ${verification_status} (regex OK)`);
  }

  // Image URL: use provided, otherwise try Tavily fallback from affiliate_url
  if (doc.product.image_url && doc.product.image_url.trim().length > 0) {
    resolved.image_url = doc.product.image_url.trim();
    const status = await headCheck(resolved.image_url);
    if (status >= 200 && status < 400) {
      logger.ok(2, `image_url HEAD=${status} OK`);
    } else {
      resolved.warnings.push(`image_url HEAD check failed (status=${status}), Tavily fallback denenecek.`);
      resolved.image_url = undefined;
    }
  }
  if (!resolved.image_url) {
    logger.info(2, `image_url boş, Tavily Extract deneniyor: ${doc.product.affiliate_url}`);
    const result = await fetchProductImageViaTavily(doc.product.affiliate_url);
    if (result.url) {
      resolved.image_url = result.url;
      logger.ok(2, `image_url Tavily: ${result.url.slice(0, 90)}...`);
    } else {
      resolved.warnings.push(`image_url bulunamadı: ${result.warning ?? 'bilinmeyen sebep'}`);
      logger.warn(2, `image_url fetch fail: ${result.warning ?? '—'}`);
    }
  }
}
