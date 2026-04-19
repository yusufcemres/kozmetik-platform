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
import { checkImageQuality } from '../enrichers/image-quality';

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

  // Image URL: use provided, otherwise try Tavily fallback from affiliate_url.
  // Quality gate (dimensions + bytes + aspect) runs on whichever URL we end up
  // with — a failed check invalidates the URL and triggers Tavily retry once.
  const provided = doc.product.image_url?.trim();
  if (provided) {
    const q = await checkImageQuality(provided);
    if (q.ok) {
      resolved.image_url = provided;
      logger.ok(2, `image_url OK (${q.width}x${q.height}, ${Math.round(q.bytes / 1024)}KB)`);
    } else {
      resolved.warnings.push(`image_url kalite reddi — ${q.reason} — Tavily fallback denenecek.`);
      logger.warn(2, `image_url kalite reddi: ${q.reason}`);
    }
  }
  if (!resolved.image_url) {
    logger.info(2, `image_url boş/reddedildi, Tavily Extract deneniyor: ${doc.product.affiliate_url}`);
    const result = await fetchProductImageViaTavily(doc.product.affiliate_url);
    if (result.url) {
      const q = await checkImageQuality(result.url);
      if (q.ok) {
        resolved.image_url = result.url;
        logger.ok(2, `image_url Tavily OK (${q.width}x${q.height}, ${Math.round(q.bytes / 1024)}KB): ${result.url.slice(0, 80)}...`);
      } else {
        resolved.warnings.push(`Tavily image kalite reddi: ${q.reason} — placeholder kullanılacak.`);
        logger.warn(2, `Tavily image kalite reddi: ${q.reason}`);
      }
    } else {
      resolved.warnings.push(`image_url bulunamadı: ${result.warning ?? 'bilinmeyen sebep'}`);
      logger.warn(2, `image_url fetch fail: ${result.warning ?? '—'}`);
    }
  }
}
