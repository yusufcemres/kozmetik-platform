import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Blog MDX içindeki ingredient/brand/product adlarını otomatik link'ler.
 * Render sırasında çağrılır (runtime substitution).
 */
@Injectable()
export class InternalLinkingService {
  constructor(private readonly dataSource: DataSource) {}

  private cache: { ingredients: Map<string, string>; brands: Map<string, string> } | null = null;
  private cachedAt = 0;

  private async getIndex() {
    if (this.cache && Date.now() - this.cachedAt < 5 * 60_000) return this.cache;
    const ings = await this.dataSource.query(
      `SELECT LOWER(inci_name) AS name, ingredient_slug AS inci_slug FROM ingredients WHERE inci_name IS NOT NULL`,
    );
    const brands = await this.dataSource.query(
      `SELECT LOWER(brand_name) AS name, brand_slug AS slug FROM brands`,
    );
    this.cache = {
      ingredients: new Map(ings.map((r: any) => [r.name, r.inci_slug])),
      brands: new Map(brands.map((r: any) => [r.name, r.slug])),
    };
    this.cachedAt = Date.now();
    return this.cache;
  }

  async enrich(mdx: string): Promise<string> {
    const idx = await this.getIndex();
    let result = mdx;
    for (const [name, slug] of idx.ingredients) {
      const re = new RegExp(`(?<![\\w\\[])${name}(?![\\w\\]])`, 'gi');
      result = result.replace(re, `[${name}](/icerikler/${slug})`);
    }
    for (const [name, slug] of idx.brands) {
      const re = new RegExp(`(?<![\\w\\[])${name}(?![\\w\\]])`, 'gi');
      result = result.replace(re, `[${name}](/markalar/${slug})`);
    }
    return result;
  }
}
