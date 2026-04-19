/**
 * Stage 2 (cosmetic) — PRODUCT_RESEARCH.
 *
 * Same image-fallback + affiliate classification as the supplement stage.
 * Kept in a separate file so the cosmetic pipeline can evolve independently
 * (e.g. future INCI-list OCR from Tavily extract without destabilising the
 * supplement flow).
 */
import type { CosmeticPipelineContext } from '../context-cosmetic';
import { classifyAffiliateUrl } from '../validators-cosmetic';
import { fetchProductImageViaTavily } from '../enrichers/tavily-image';
import { checkImageQuality } from '../enrichers/image-quality';

export async function runCosmeticProductResearch(ctx: CosmeticPipelineContext): Promise<void> {
  const { doc, resolved, logger } = ctx;
  logger.section('PRODUCT_RESEARCH');

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
    logger.info(2, `image_url boş/reddedildi, Tavily Extract deneniyor.`);
    const result = await fetchProductImageViaTavily(doc.product.affiliate_url);
    if (result.url) {
      const q = await checkImageQuality(result.url);
      if (q.ok) {
        resolved.image_url = result.url;
        logger.ok(2, `image_url Tavily OK (${q.width}x${q.height}).`);
      } else {
        resolved.warnings.push(`Tavily image kalite reddi: ${q.reason}`);
        logger.warn(2, `Tavily image kalite reddi: ${q.reason}`);
      }
    } else {
      resolved.warnings.push(`image_url bulunamadı: ${result.warning ?? 'bilinmeyen'}`);
      logger.warn(2, `image_url fetch fail: ${result.warning ?? '—'}`);
    }
  }
}
