import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface TagConflict {
  productId: number;
  tagKey: string;
  conflictReason: string;
}

/**
 * Katman 5 — Çakışma tespiti.
 * Örn: INCI "lanolin" içerir + marka "vegan" claim → çakışma → admin review.
 */
@Injectable()
export class TagConflictDetectorService {
  constructor(private readonly dataSource: DataSource) {}

  async detectForProduct(productId: number): Promise<TagConflict[]> {
    const conflicts: TagConflict[] = [];

    const veganConflict = await this.dataSource.query(
      `
      SELECT 1
      FROM products p
      JOIN brand_certifications bc ON bc.brand_id = p.brand_id
      JOIN LATERAL (
        SELECT LOWER(jsonb_array_elements_text(COALESCE(p.ingredients_inci, '[]'::jsonb))) AS inci
      ) inci_list ON true
      JOIN ingredients i ON i.inci_slug = regexp_replace(inci_list.inci, '[^a-z0-9]+', '-', 'g')
      WHERE p.product_id = $1
        AND bc.cert_code LIKE 'vegan%'
        AND i.is_animal_derived = true
      LIMIT 1
      `,
      [productId],
    );
    if (veganConflict.length > 0) {
      conflicts.push({
        productId,
        tagKey: 'vegan_conflict',
        conflictReason: 'Marka vegan sertifikalı ama INCI listesi hayvansal kaynak içerir',
      });
    }
    return conflicts;
  }
}
