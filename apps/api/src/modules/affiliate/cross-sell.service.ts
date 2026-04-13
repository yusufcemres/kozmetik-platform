import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Faz L — "Birlikte iyi gider" + "Benzer ciltler beğendi" + "Aynı markadan".
 */
@Injectable()
export class CrossSellService {
  constructor(private readonly dataSource: DataSource) {}

  async togetherBetter(productId: number, limit = 6) {
    return this.dataSource.query(
      `
      SELECT p2.product_id, p2.product_name, p2.slug, p2.image_url, c.category_name
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
      SELECT p2.product_id, p2.product_name, p2.slug, p2.image_url
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
      SELECT p2.product_id, p2.product_name, p2.slug, p2.image_url, COUNT(*) AS overlap
      FROM product_needs pn1
      JOIN product_needs pn2 ON pn2.need_id = pn1.need_id AND pn2.product_id <> pn1.product_id
      JOIN products p2 ON p2.product_id = pn2.product_id AND p2.status = 'published'
      WHERE pn1.product_id = $1
      GROUP BY p2.product_id, p2.product_name, p2.slug, p2.image_url
      ORDER BY overlap DESC
      LIMIT $2
      `,
      [productId, limit],
    );
  }
}
