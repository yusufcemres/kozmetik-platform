import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Profile × products → kişisel öneri feed'i.
 * Basit heuristic: skin_concerns ↔ needs mapping + alerji filtresi + etik filtre.
 */
@Injectable()
export class RecommendationMatcherService {
  constructor(private readonly dataSource: DataSource) {}

  async matchForUser(userId: number, limit = 20) {
    const profileRows = await this.dataSource.query(
      `SELECT * FROM user_profiles WHERE user_id = $1`,
      [userId],
    );
    const profile = profileRows[0];
    if (!profile) return [];

    const concerns: string[] = profile.skin_concerns || [];

    return this.dataSource.query(
      `
      SELECT DISTINCT
        p.product_id,
        p.product_name,
        p.product_slug AS slug,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.sort_order NULLS LAST LIMIT 1) AS image_url,
        p.brand_id
      FROM products p
      LEFT JOIN product_need_scores pns ON pns.product_id = p.product_id
      LEFT JOIN needs n ON n.need_id = pns.need_id
      WHERE p.status = 'published'
        AND (cardinality($1::text[]) = 0 OR n.need_slug = ANY($1))
      ORDER BY p.product_id DESC
      LIMIT $2
      `,
      [concerns, limit],
    );
  }

  async checkProductAllergyForUser(userId: number, productId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT ing.ingredient_id, ing.inci_name
      FROM user_profiles up
      JOIN product_ingredients pi ON pi.product_id = $2
      JOIN ingredients ing ON ing.ingredient_id = pi.ingredient_id
      WHERE up.user_id = $1
        AND up.allergy_ingredient_ids IS NOT NULL
        AND ing.ingredient_id = ANY(up.allergy_ingredient_ids)
      `,
      [userId, productId],
    );
    return { alert: rows.length > 0, matched: rows };
  }
}
