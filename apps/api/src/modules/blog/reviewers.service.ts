import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReviewersService {
  constructor(private readonly dataSource: DataSource) {}

  list() {
    return this.dataSource.query(
      `SELECT reviewer_id, name, title, credentials, specialty, avatar_url, public_slug
       FROM reviewers WHERE is_active = true ORDER BY name`,
    );
  }

  async getBySlug(slug: string) {
    const rows = await this.dataSource.query(
      `SELECT * FROM reviewers WHERE public_slug = $1 AND is_active = true`,
      [slug],
    );
    if (!rows[0]) throw new NotFoundException('reviewer_not_found');
    const reviewerId = rows[0].reviewer_id;
    const posts = await this.dataSource.query(
      `SELECT slug, title, excerpt, published_at FROM blog_posts
       WHERE medical_reviewer_id = $1 AND status = 'published'
       ORDER BY published_at DESC`,
      [reviewerId],
    );
    const ingredients = await this.dataSource.query(
      `SELECT ingredient_id, inci_name, ingredient_slug AS inci_slug, last_reviewed_at FROM ingredients
       WHERE medical_reviewer_id = $1`,
      [reviewerId],
    );
    return { reviewer: rows[0], posts, ingredients };
  }
}
