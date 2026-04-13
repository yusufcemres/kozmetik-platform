import { Body, Controller, Ip, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { ShortcutMatcherService } from './shortcut-matcher.service';
import { FallbackService } from './fallback.service';

@Controller('ai-search')
export class AiSearchController {
  constructor(
    private readonly matcher: ShortcutMatcherService,
    private readonly fallback: FallbackService,
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  @Throttle({ default: { ttl: 86_400_000, limit: 30 } })
  async search(
    @Body() body: { query: string; user_id?: number; session_id?: string },
    @Ip() ip: string,
  ) {
    const query = (body?.query || '').trim();
    if (!query) return { type: 'empty' };

    const match = await this.matcher.match(query);
    if (match) {
      await this.matcher.logQuery(query, match.shortcut_id, body.user_id || null, body.session_id || null, ip || null);

      const productIds: number[] = match.product_ids || [];
      const ingredientIds: number[] = match.ingredient_ids || [];
      const blogIds: number[] = match.blog_post_ids || [];

      const [products, ingredients, posts] = await Promise.all([
        productIds.length
          ? this.dataSource.query(
              `SELECT product_id, product_name, slug, image_url FROM products
               WHERE product_id = ANY($1) AND status = 'published'`,
              [productIds],
            )
          : [],
        ingredientIds.length
          ? this.dataSource.query(
              `SELECT ingredient_id, inci_name, inci_slug FROM ingredients WHERE ingredient_id = ANY($1)`,
              [ingredientIds],
            )
          : [],
        blogIds.length
          ? this.dataSource.query(
              `SELECT post_id, slug, title, excerpt FROM blog_posts WHERE post_id = ANY($1) AND status = 'published'`,
              [blogIds],
            )
          : [],
      ]);

      return {
        type: 'shortcut',
        intent: match.intent_key,
        title: match.title,
        description: match.description,
        caution: match.caution,
        products,
        ingredients,
        posts,
      };
    }

    await this.matcher.logQuery(query, null, body.user_id || null, body.session_id || null, ip || null);
    const products = await this.fallback.search(query);
    return { type: 'fallback', query, products };
  }
}
