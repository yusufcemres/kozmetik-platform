import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Faz L — "Birlikte iyi gider" + "Benzer ciltler beğendi" + "Aynı markadan".
 */
@Injectable()
export class CrossSellService {
  constructor(private readonly dataSource: DataSource) {}

  private readonly selectCols = `
    p2.product_id,
    p2.product_name,
    p2.product_slug AS slug,
    (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p2.product_id ORDER BY pi.sort_order NULLS LAST LIMIT 1) AS image_url
  `;

  async togetherBetter(productId: number, limit = 6) {
    return this.dataSource.query(
      `
      SELECT ${this.selectCols}
      FROM products p1
      JOIN categories c1 ON c1.category_id = p1.category_id
      JOIN categories c ON c.parent_category_id = c1.parent_category_id AND c.category_id <> c1.category_id
      JOIN products p2 ON p2.category_id = c.category_id AND p2.status = 'published' AND p2.product_id <> p1.product_id
      WHERE p1.product_id = $1
      ORDER BY p2.product_id DESC
      LIMIT $2
      `,
      [productId, limit],
    );
  }

  async sameBrand(productId: number, limit = 6) {
    return this.dataSource.query(
      `
      SELECT ${this.selectCols}
      FROM products p1
      JOIN products p2 ON p2.brand_id = p1.brand_id AND p2.product_id <> p1.product_id AND p2.status = 'published'
      WHERE p1.product_id = $1
      ORDER BY p2.product_id DESC
      LIMIT $2
      `,
      [productId, limit],
    );
  }

  async similarByNeeds(productId: number, limit = 6) {
    return this.dataSource.query(
      `
      SELECT ${this.selectCols}, COUNT(*) AS overlap
      FROM product_need_scores pn1
      JOIN product_need_scores pn2 ON pn2.need_id = pn1.need_id AND pn2.product_id <> pn1.product_id
      JOIN products p2 ON p2.product_id = pn2.product_id AND p2.status = 'published'
      WHERE pn1.product_id = $1
      GROUP BY p2.product_id, p2.product_name, p2.product_slug
      ORDER BY overlap DESC
      LIMIT $2
      `,
      [productId, limit],
    );
  }
}
