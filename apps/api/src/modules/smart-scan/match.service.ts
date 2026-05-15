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
   * OpenBeautyFacts'ten ürün verisi çek — Yuka modeli, açık veri.
   * Bulduğunda REVELA-uyumlu ham nesne döner; çağıran taraf isterse
   * draft olarak DB'ye import eder. Hata olursa null.
   */
  async fetchFromOpenBeautyFacts(barcode: string): Promise<{
    barcode: string;
    product_name: string | null;
    brand_name: string | null;
    image_url: string | null;
    ingredients_raw: string | null;
    ingredients_list: string[];
    net_content: string | null;
    obf_url: string;
    completeness: number;
  } | null> {
    if (!barcode || barcode.length < 8) return null;
    try {
      const url = `https://world.openbeautyfacts.org/api/v2/product/${barcode}.json`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'REVELA/1.0 (https://kozmetik-platform.vercel.app)' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        status?: number;
        product?: {
          product_name?: string;
          product_name_en?: string;
          brands?: string;
          ingredients_text?: string;
          ingredients_text_en?: string;
          ingredients_text_tr?: string;
          image_url?: string;
          image_front_url?: string;
        };
      };
      if (data.status !== 1 || !data.product) return null;
      const p = data.product;
      const inciRaw: string = p.ingredients_text_en || p.ingredients_text || p.ingredients_text_tr || '';
      const inciTokens = inciRaw
        .replace(/[\(\[].*?[\)\]]/g, '')
        .split(/[,;\.\n]+/)
        .map((s: string) => s.trim().replace(/^["'`]+|["'`]+$/g, ''))
        .filter((s: string) => s.length > 1 && s.length < 100)
        .slice(0, 80);
      return {
        barcode,
        product_name: p.product_name || p.product_name_en || null,
        brand_name: (p.brands || '').split(',')[0]?.trim() || null,
        image_url: p.image_front_url || p.image_url || null,
        ingredients_raw: inciRaw || null,
        ingredients_list: inciTokens,
        net_content: p.quantity || null,
        obf_url: `https://world.openbeautyfacts.org/product/${barcode}`,
        completeness: Number(p.completeness) || 0,
      };
    } catch {
      return null;
    }
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
