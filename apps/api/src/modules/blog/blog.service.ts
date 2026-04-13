import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogService {
  constructor(private readonly dataSource: DataSource) {}

  async list(params: { category?: string; tag?: string; limit?: number; offset?: number } = {}) {
    const limit = Math.min(params.limit ?? 20, 50);
    const offset = params.offset ?? 0;
    return this.dataSource.query(
      `
      SELECT bp.post_id, bp.slug, bp.title, bp.excerpt, bp.og_image_url,
             bp.published_at, bp.reading_time_min, bp.category, bp.tags,
             a.name AS author_name, a.public_slug AS author_slug,
             r.name AS reviewer_name, r.public_slug AS reviewer_slug
      FROM blog_posts bp
      LEFT JOIN authors a ON a.author_id = bp.author_id
      LEFT JOIN reviewers r ON r.reviewer_id = bp.medical_reviewer_id
      WHERE bp.status = 'published'
        AND ($1::text IS NULL OR bp.category = $1)
        AND ($2::text IS NULL OR $2 = ANY(bp.tags))
      ORDER BY bp.published_at DESC NULLS LAST
      LIMIT $3 OFFSET $4
      `,
      [params.category || null, params.tag || null, limit, offset],
    );
  }

  async getBySlug(slug: string) {
    const rows = await this.dataSource.query(
      `
      SELECT bp.*, a.name AS author_name, a.credentials AS author_credentials,
             a.bio AS author_bio, a.public_slug AS author_slug, a.avatar_url AS author_avatar,
             r.name AS reviewer_name, r.credentials AS reviewer_credentials,
             r.title AS reviewer_title, r.public_slug AS reviewer_slug,
             r.avatar_url AS reviewer_avatar
      FROM blog_posts bp
      LEFT JOIN authors a ON a.author_id = bp.author_id
      LEFT JOIN reviewers r ON r.reviewer_id = bp.medical_reviewer_id
      WHERE bp.slug = $1 AND bp.status = 'published'
      `,
      [slug],
    );
    if (!rows[0]) throw new NotFoundException('post_not_found');

    const postId = rows[0].post_id;
    const products = await this.dataSource.query(
      `SELECT p.product_id,
              p.product_name,
              p.product_slug AS slug,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.sort_order NULLS LAST LIMIT 1) AS image_url
       FROM blog_post_products bpp
       JOIN products p ON p.product_id = bpp.product_id
       WHERE bpp.post_id = $1 AND p.status = 'published'
       ORDER BY bpp.sort_order`,
      [postId],
    );
    const ingredients = await this.dataSource.query(
      `SELECT i.ingredient_id, i.inci_name, i.ingredient_slug AS inci_slug
       FROM blog_post_ingredients bpi
       JOIN ingredients i ON i.ingredient_id = bpi.ingredient_id
       WHERE bpi.post_id = $1`,
      [postId],
    );
    return { post: rows[0], products, ingredients };
  }

  async slugs() {
    return this.dataSource.query(
      `SELECT slug, updated_at FROM blog_posts WHERE status = 'published'`,
    );
  }
}
