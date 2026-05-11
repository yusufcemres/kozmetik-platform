import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { UnknownScan, ScanHistory } from '@database/entities';
import { VisionService } from './vision.service';
import { MatchService, MatchCandidate } from './match.service';

export interface SmartScanRequest {
  barcode?: string;
  image_base64?: string;
  image_mime?: string;
  user_id?: number;
  ip?: string;
}

export interface SmartScanResponse {
  status: 'matched' | 'candidates' | 'unknown';
  method: 'barcode' | 'vision' | 'vision_fuzzy' | null;
  confidence: number;
  product?: {
    product_id: number;
    product_slug: string;
    product_name: string;
    brand_name: string;
  };
  candidates?: MatchCandidate[];
  vision_result?: any;
  scan_id?: number;
}

@Injectable()
export class SmartScanService {
  private readonly logger = new Logger(SmartScanService.name);
  private readonly cache = new Map<string, { res: SmartScanResponse; ts: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(UnknownScan) private readonly unknowns: Repository<UnknownScan>,
    @InjectRepository(ScanHistory) private readonly history: Repository<ScanHistory>,
    private readonly vision: VisionService,
    private readonly match: MatchService,
  ) {}

  async scan(req: SmartScanRequest): Promise<SmartScanResponse> {
    // === Pipeline A: Barcode (REVELA DB) ===
    if (req.barcode) {
      const product = await this.match.findByBarcode(req.barcode);
      if (product) {
        await this.recordHistory(req.user_id, product.product_id, 'barcode', 1.0, req.barcode, null);
        return {
          status: 'matched',
          method: 'barcode',
          confidence: 1.0,
          product: {
            product_id: product.product_id,
            product_slug: product.product_slug,
            product_name: product.product_name,
            brand_name: product.brand?.brand_name ?? '',
          },
        };
      }

      // === Pipeline A2: OpenBeautyFacts (acik veri, Yuka modeli) ===
      const obf = await this.match.fetchFromOpenBeautyFacts(req.barcode);
      if (obf && (obf.product_name || obf.ingredients_list.length > 0)) {
        // External match — kullaniciya goster ama draft urun olarak DB'ye yazma
        // ileride admin onayi ile tam katmandan kayit edilebilir
        return {
          status: 'candidates',
          method: 'vision_fuzzy',
          confidence: 0.5,
          candidates: [],
          vision_result: {
            brand: obf.brand_name,
            product_name: obf.product_name,
            product_type: null,
            detected_text: obf.ingredients_raw,
            confidence: obf.completeness || 0.5,
            source: 'openbeautyfacts',
            barcode: obf.barcode,
            image_url: obf.image_url,
            ingredients_list: obf.ingredients_list,
            obf_url: obf.obf_url,
          } as any,
        };
      }
    }

    // === Pipeline B: Vision AI ===
    if (req.image_base64) {
      const imageHash = createHash('md5').update(req.image_base64.slice(0, 1000)).digest('hex');

      // Cache check
      const cached = this.cache.get(imageHash);
      if (cached && Date.now() - cached.ts < this.CACHE_TTL) {
        this.logger.log(`Cache hit: ${imageHash.slice(0, 8)}`);
        return cached.res;
      }

      const visionResult = await this.vision.recognizeProduct(req.image_base64, req.image_mime);
      this.logger.log(`Vision: brand=${visionResult.brand} product=${visionResult.product_name} conf=${visionResult.confidence}`);

      if (visionResult.brand || visionResult.product_name) {
        const candidates = await this.match.findByVisionText(visionResult.brand, visionResult.product_name);

        if (candidates.length > 0) {
          const best = candidates[0];

          // Auto-match if very confident
          if (best.similarity >= 0.6) {
            await this.recordHistory(
              req.user_id,
              best.product_id,
              'vision',
              best.similarity,
              null,
              `${visionResult.brand} ${visionResult.product_name}`,
            );
            const response: SmartScanResponse = {
              status: 'matched',
              method: 'vision',
              confidence: best.similarity,
              product: {
                product_id: best.product_id,
                product_slug: best.product_slug,
                product_name: best.product_name,
                brand_name: best.brand_name,
              },
              vision_result: visionResult,
            };
            this.cache.set(imageHash, { res: response, ts: Date.now() });
            return response;
          }

          // Multiple candidates — let user pick
          return {
            status: 'candidates',
            method: 'vision_fuzzy',
            confidence: best.similarity,
            candidates,
            vision_result: visionResult,
          };
        }
      }

      // No match — queue for admin review
      const unknown = await this.unknowns.save(this.unknowns.create({
        user_id: req.user_id ?? null,
        barcode: req.barcode ?? null,
        detected_brand: visionResult.brand,
        detected_name: visionResult.product_name,
        ocr_text: visionResult.detected_text,
        image_hash: imageHash,
        ip: req.ip ?? null,
        status: 'pending',
      }));

      return {
        status: 'unknown',
        method: null,
        confidence: 0,
        vision_result: visionResult,
        scan_id: unknown.scan_id,
      };
    }

    return { status: 'unknown', method: null, confidence: 0 };
  }

  private async recordHistory(
    userId: number | undefined,
    productId: number | null,
    method: string,
    confidence: number,
    barcode: string | null,
    query: string | null,
  ): Promise<void> {
    if (!userId) return;
    try {
      await this.history.save(this.history.create({
        user_id: userId,
        product_id: productId,
        method,
        confidence,
        raw_barcode: barcode,
        raw_query: query,
      }));
    } catch (err: any) {
      this.logger.error(`History save failed: ${err.message}`);
    }
  }

  /**
   * Public topluluk istatistigi — homepage sosyal kanit sayaci.
   * 1 saat Redis cache verilebilir ama oturumda 1 sorgu yeterli.
   */
  async getPublicStats(): Promise<{
    total_scans: number;
    total_scanners: number;
    unique_products: number;
    scans_this_month: number;
  }> {
    const rows = await this.history.manager.query(
      `SELECT
        COUNT(*)::int AS total_scans,
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL)::int AS total_scanners,
        COUNT(DISTINCT product_id) FILTER (WHERE product_id IS NOT NULL)::int AS unique_products,
        COUNT(*) FILTER (WHERE created_at > date_trunc('month', NOW()))::int AS scans_this_month
       FROM scan_history`,
    );
    return rows[0] || { total_scans: 0, total_scanners: 0, unique_products: 0, scans_this_month: 0 };
  }

  async getUserHistory(userId: number, limit = 50): Promise<any[]> {
    // Enriched: product + brand + image JOIN
    return this.history.manager.query(
      `SELECT
        sh.history_id, sh.user_id, sh.product_id, sh.method, sh.confidence,
        sh.raw_barcode, sh.raw_query, sh.created_at,
        p.product_name, p.product_slug, p.top_need_name,
        b.brand_name,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY pi.sort_order ASC LIMIT 1) AS image_url
      FROM scan_history sh
      LEFT JOIN products p ON p.product_id = sh.product_id
      LEFT JOIN brands b ON b.brand_id = p.brand_id
      WHERE sh.user_id = $1
      ORDER BY sh.created_at DESC
      LIMIT $2`,
      [userId, limit],
    );
  }
}
