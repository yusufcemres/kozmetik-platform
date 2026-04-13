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
      SELECT product_id, product_name, slug, image_url
      FROM products
      WHERE status = 'published'
        AND (product_name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%')
      ORDER BY product_id DESC
      LIMIT $2
      `,
      [query, limit],
    );
  }
}
