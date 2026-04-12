import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '@database/entities';

export interface MatchCandidate {
  product_id: number;
  product_slug: string;
  product_name: string;
  brand_name: string;
  similarity: number;
  method: 'barcode' | 'vision_trgm' | 'ocr_ingredient';
}

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async findByBarcode(barcode: string): Promise<Product | null> {
    if (!barcode || barcode.length < 8) return null;
    return this.products.findOne({
      where: { barcode },
      relations: ['brand', 'category'],
    });
  }

  /**
   * Fuzzy match using pg_trgm on brand name + product name.
   * Higher weight when both brand and product name match.
   */
  async findByVisionText(brand: string | null, productName: string | null): Promise<MatchCandidate[]> {
    if (!brand && !productName) return [];

    const brandQuery = (brand ?? '').trim();
    const nameQuery = (productName ?? '').trim();

    // Combined trigram query: score = brand_sim * 0.4 + product_sim * 0.6
    const rows = await this.dataSource.query(
      `
      SELECT
        p.product_id,
        p.product_slug,
        p.product_name,
        b.brand_name,
        (
          COALESCE(similarity(b.brand_name, $1), 0) * 0.4 +
          COALESCE(similarity(p.product_name, $2), 0) * 0.6
        ) AS score
      FROM products p
      JOIN brands b ON p.brand_id = b.brand_id
      WHERE
        ($1 <> '' AND b.brand_name % $1)
        OR ($2 <> '' AND p.product_name % $2)
      ORDER BY score DESC
      LIMIT 5
      `,
      [brandQuery, nameQuery],
    );

    return rows.map((r: any) => ({
      product_id: r.product_id,
      product_slug: r.product_slug,
      product_name: r.product_name,
      brand_name: r.brand_name,
      similarity: parseFloat(r.score),
      method: 'vision_trgm' as const,
    }));
  }
}
