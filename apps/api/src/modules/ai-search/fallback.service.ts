import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Shortcut eşleşmezse full-text search sonuçları.
 */
@Injectable()
export class FallbackService {
  constructor(private readonly dataSource: DataSource) {}

  async search(query: string, limit = 20) {
    return this.dataSource.query(
      `
      SELECT p.product_id,
             p.product_name,
             p.product_slug AS slug,
             (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.sort_order NULLS LAST LIMIT 1) AS image_url
      FROM products p
      WHERE p.status = 'published'
        AND p.product_name ILIKE '%' || $1 || '%'
      ORDER BY p.product_id DESC
      LIMIT $2
      `,
      [query, limit],
    );
  }
}
