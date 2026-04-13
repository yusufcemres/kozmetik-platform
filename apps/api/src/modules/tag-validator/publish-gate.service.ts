import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TagDeriverService } from './tag-deriver.service';
import { TagCertifierService } from './tag-certifier.service';
import { TagConflictDetectorService } from './tag-conflict-detector.service';

export interface PublishCheckResult {
  productId: number;
  ok: boolean;
  reasons: string[];
}

/**
 * Publish gate — ürün 'published' statüsüne geçmeden önce zorunlu kontroller.
 *  - ≥1 görsel
 *  - INCI parse edilmiş
 *  - ≥3 deterministik tag
 *  - kategori + alt kategori dolu
 *  - çakışma yok
 *  - TİTCK banned değil
 */
@Injectable()
export class PublishGateService {
  private readonly logger = new Logger(PublishGateService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly deriver: TagDeriverService,
    private readonly certifier: TagCertifierService,
    private readonly conflicts: TagConflictDetectorService,
  ) {}

  async check(productId: number): Promise<PublishCheckResult> {
    const reasons: string[] = [];
    const rows = await this.dataSource.query(
      `SELECT image_url, category_id, ingredients_inci, titck_status
       FROM products WHERE product_id = $1`,
      [productId],
    );
    const p = rows[0];
    if (!p) return { productId, ok: false, reasons: ['product_not_found'] };

    if (!p.image_url) reasons.push('missing_image');
    if (!p.category_id) reasons.push('missing_category');
    if (!p.ingredients_inci || (Array.isArray(p.ingredients_inci) && p.ingredients_inci.length === 0)) {
      reasons.push('missing_inci');
    }
    if (p.titck_status === 'banned') reasons.push('titck_banned');

    const derived = await this.deriver.deriveForProduct(productId);
    if (derived.length < 3) reasons.push('insufficient_tags');

    await this.certifier.certifyForProduct(productId);
    const conflicts = await this.conflicts.detectForProduct(productId);
    if (conflicts.length > 0) reasons.push(...conflicts.map((c) => c.conflictReason));

    return { productId, ok: reasons.length === 0, reasons };
  }

  async runBulk(limit = 500): Promise<{ passed: number; failed: number; reasonCounts: Record<string, number> }> {
    const rows = await this.dataSource.query(
      `SELECT product_id FROM products WHERE status = 'draft' ORDER BY product_id LIMIT $1`,
      [limit],
    );
    const reasonCounts: Record<string, number> = {};
    let passed = 0;
    let failed = 0;
    for (const r of rows) {
      const res = await this.check(r.product_id);
      if (res.ok) {
        await this.dataSource.query(
          `UPDATE products SET status = 'published', published_at = NOW() WHERE product_id = $1`,
          [r.product_id],
        );
        passed++;
      } else {
        failed++;
        for (const reason of res.reasons) reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      }
    }
    this.logger.log(`Publish gate: ${passed} passed, ${failed} failed`);
    return { passed, failed, reasonCounts };
  }
}
