import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { UnknownScan, ScanHistory, ProductIngredient } from '@database/entities';
import { VisionService, VisionResult } from './vision.service';
import { MatchService, MatchCandidate } from './match.service';
import { IngredientsService } from '../ingredients/ingredients.service';

/** ingredients.analyzeInciList return shape — explicit type yerine ReturnType reuse. */
type InciAnalysisResult = Awaited<ReturnType<IngredientsService['analyzeInciList']>>;

export interface SmartScanRequest {
  barcode?: string;
  image_base64?: string;
  image_mime?: string;
  user_id?: number;
  ip?: string;
}

export interface SmartScanResponse {
  status: 'matched' | 'candidates' | 'unknown' | 'inci_only';
  method: 'barcode' | 'vision' | 'vision_fuzzy' | 'inci_only' | null;
  confidence: number;
  product?: {
    product_id: number;
    product_slug: string;
    product_name: string;
    brand_name: string;
  };
  candidates?: MatchCandidate[];
  vision_result?: VisionResult;
  scan_id?: number;
  /** Yeni fotodan eklenen INCI sayisi (matched product enrichment). */
  enriched_inci_count?: number;
  /** Vision'in fotodan okuduğu tüm INCI'lerin analiz sonucu (inci-only mode + enrichment için). */
  inci_analysis?: InciAnalysisResult;
}

@Injectable()
export class SmartScanService {
  private readonly logger = new Logger(SmartScanService.name);
  private readonly cache = new Map<string, { res: SmartScanResponse; ts: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(UnknownScan) private readonly unknowns: Repository<UnknownScan>,
    @InjectRepository(ScanHistory) private readonly history: Repository<ScanHistory>,
    @InjectRepository(ProductIngredient) private readonly pi: Repository<ProductIngredient>,
    private readonly vision: VisionService,
    private readonly match: MatchService,
    private readonly ingredientsService: IngredientsService,
  ) {}

  /**
   * Fotodan okunan INCI listesini mevcut urune ekle. Sadece master'da olmayan
   * INCI'ler eklenir. Kullaniciya kac yeni INCI eklendigi bildirilir.
   */
  private async enrichProductWithInci(
    productId: number,
    inciList: string[],
  ): Promise<{ added: number; analysis: InciAnalysisResult | null }> {
    if (!inciList || inciList.length === 0) return { added: 0, analysis: null };
    // ingredients.analyzeInciList ile fuzzy match
    const analysis = await this.ingredientsService.analyzeInciList(inciList.join(', '));
    type Token = InciAnalysisResult['tokens'][number];
    const matched = ((analysis.tokens || []) as Token[]).filter((t) => t.matched && t.ingredient);
    if (matched.length === 0) return { added: 0, analysis };
    // Mevcut INCI'leri al
    const existing = await this.pi
      .createQueryBuilder('pi')
      .where('pi.product_id = :pid AND pi.ingredient_id IS NOT NULL', { pid: productId })
      .getMany();
    const existingIds = new Set(existing.map((e) => e.ingredient_id));
    const maxRank = existing.reduce((m, e) => Math.max(m, e.inci_order_rank || 0), 0);
    let rank = maxRank;
    let added = 0;
    for (const t of matched) {
      if (!t.ingredient) continue;
      const ingId = t.ingredient.ingredient_id;
      if (existingIds.has(ingId)) continue;
      // ONEMLI: pending_review status — admin onayina kadar publike gosterilmez
      // (false-positive INCI eklenmesini önler, örn. PEG-60 hatasi)
      rank++;
      await this.pi.save(
        this.pi.create({
          product_id: productId,
          ingredient_id: ingId,
          ingredient_display_name: t.ingredient.inci_name || t.raw,
          inci_order_rank: rank,
          concentration_band: 'unknown',
          is_below_one_percent_estimate: false,
          is_highlighted_in_claims: false,
          match_status: 'pending_review',
        } as any),
      );
      added++;
    }
    return { added, analysis };
  }

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

      // Cache check — enrichment varsa cache atla (DB'ye yeni veri yazılır)
      const visionResult = await this.vision.recognizeProduct(req.image_base64, req.image_mime);
      this.logger.log(`Vision: brand=${visionResult.brand} product=${visionResult.product_name} inci_count=${(visionResult.ingredients_list || []).length} conf=${visionResult.confidence}`);

      // Provider'lar fail olduysa "Ürün bulunamadı" yerine 503 — frontend
      // "AI okuyucu geçici olarak kullanılamıyor, biraz sonra dene" gösterir.
      if (visionResult.provider_unavailable) {
        throw new ServiceUnavailableException(
          'AI görsel tanıma servisi şu an yanıt vermiyor. Lütfen birkaç dakika sonra tekrar deneyin.',
        );
      }

      const hasIncis = (visionResult.ingredients_list || []).length >= 3;

      if (visionResult.brand || visionResult.product_name) {
        const candidates = await this.match.findByVisionText(visionResult.brand, visionResult.product_name);

        if (candidates.length > 0) {
          const best = candidates[0];

          if (best.similarity >= 0.6) {
            // === Matched → enrich INCIs from new photo ===
            let enrichResult = { added: 0, analysis: null as any };
            if (hasIncis) {
              try {
                enrichResult = await this.enrichProductWithInci(best.product_id, visionResult.ingredients_list!);
                this.logger.log(`Enrich: product #${best.product_id} added ${enrichResult.added} new INCIs`);
              } catch (err) {
                this.logger.warn(`Enrich failed: ${err instanceof Error ? err.message : err}`);
              }
            }
            await this.recordHistory(
              req.user_id,
              best.product_id,
              'vision',
              best.similarity,
              null,
              `${visionResult.brand} ${visionResult.product_name}`,
            );
            return {
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
              enriched_inci_count: enrichResult.added,
              inci_analysis: enrichResult.analysis,
            };
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

      // === INCI-only mode: ürün tanınamadı ama bileşen listesi okundu ===
      if (hasIncis) {
        try {
          const analysis = await this.ingredientsService.analyzeInciList(visionResult.ingredients_list!.join(', '));
          await this.recordHistory(req.user_id, null, 'vision', visionResult.confidence, null, `INCI-only: ${visionResult.ingredients_list!.length} items`);
          return {
            status: 'inci_only',
            method: 'inci_only',
            confidence: visionResult.confidence,
            vision_result: visionResult,
            inci_analysis: analysis,
          };
        } catch (err) {
          this.logger.warn(`INCI-only analysis failed: ${err instanceof Error ? err.message : err}`);
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
    } catch (err) {
      this.logger.error(`History save failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  /**
   * Public topluluk istatistigi — homepage sosyal kanit sayaci.
   * 5dk in-memory cache: scraping defense + DB load azaltma (controller'da @Throttle 10/min + CDN edge cache de var).
   * 2026-05-19 audit (Madde 4): cache 60s→5dk, throttle 30→10/min, CDN s-maxage=300 eklendi.
   */
  private statsCache: { value: { total_scans: number; total_scanners: number; unique_products: number; scans_this_month: number } | null; ts: number } = { value: null, ts: 0 };
  private readonly STATS_CACHE_TTL = 5 * 60_000;

  async getPublicStats(): Promise<{
    total_scans: number;
    total_scanners: number;
    unique_products: number;
    scans_this_month: number;
  }> {
    if (this.statsCache.value && Date.now() - this.statsCache.ts < this.STATS_CACHE_TTL) {
      return this.statsCache.value;
    }
    const rows = await this.history.manager.query(
      `SELECT
        COUNT(*)::int AS total_scans,
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL)::int AS total_scanners,
        COUNT(DISTINCT product_id) FILTER (WHERE product_id IS NOT NULL)::int AS unique_products,
        COUNT(*) FILTER (WHERE created_at > date_trunc('month', NOW()))::int AS scans_this_month
       FROM scan_history`,
    );
    const value = rows[0] || { total_scans: 0, total_scanners: 0, unique_products: 0, scans_this_month: 0 };
    this.statsCache = { value, ts: Date.now() };
    return value;
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
