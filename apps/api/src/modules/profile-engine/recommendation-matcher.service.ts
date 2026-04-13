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

    const concerns = profile.skin_concerns || [];
    const allergies = profile.allergy_ingredient_ids || [];

    return this.dataSource.query(
      `
      SELECT DISTINCT p.product_id, p.product_name, p.slug, p.image_url, p.brand_id
      FROM products p
      LEFT JOIN product_needs pn ON pn.product_id = p.product_id
      LEFT JOIN needs n ON n.need_id = pn.need_id
      WHERE p.status = 'published'
        AND (cardinality($1::text[]) = 0 OR n.need_slug = ANY($1))
        AND NOT EXISTS (
          SELECT 1 FROM LATERAL (
            SELECT LOWER(jsonb_array_elements_text(COALESCE(p.ingredients_inci, '[]'::jsonb))) AS inci
          ) i
          JOIN ingredients ing ON ing.inci_slug = regexp_replace(i.inci, '[^a-z0-9]+', '-', 'g')
          WHERE ing.ingredient_id = ANY($2)
        )
      ORDER BY p.product_id DESC
      LIMIT $3
      `,
      [concerns, allergies, limit],
    );
  }

  async checkProductAllergyForUser(userId: number, productId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT ing.ingredient_id, ing.inci_name
      FROM user_profiles up
      JOIN LATERAL (
        SELECT LOWER(jsonb_array_elements_text(COALESCE(p.ingredients_inci, '[]'::jsonb))) AS inci
        FROM products p WHERE p.product_id = $2
      ) i ON true
      JOIN ingredients ing ON ing.inci_slug = regexp_replace(i.inci, '[^a-z0-9]+', '-', 'g')
      WHERE up.user_id = $1
        AND ing.ingredient_id = ANY(up.allergy_ingredient_ids)
      `,
      [userId, productId],
    );
    return { alert: rows.length > 0, matched: rows };
  }
}
