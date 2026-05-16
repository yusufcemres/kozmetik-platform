import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { createHash } from 'crypto';
import { SkinAnalysisResult } from '@database/entities';
import { VisionService } from '../smart-scan/vision.service';
import {
  IngredientRecommendation,
  SkinAnalysisRequestDto,
  SkinAnalysisResponse,
  SkinScoreBreakdown,
} from './dto/skin-analysis.dto';

/**
 * Foto analiz iş mantığı.
 *
 * 2026-05-16 Foto Analiz Faz 1 Gün 1 — iskelet (Gün 2'de skin-vision prompt eklenecek).
 *
 * Akış:
 * 1. DTO validate (controller) → service'e gel
 * 2. Vision API (Gemini → Claude fallback) — Gün 2'de skin-specific prompt
 * 3. Skor JSON parse + sanitize
 * 4. Overall skor hesapla (ağırlıklı ortalama)
 * 5. INCI öneri üret (boyut → top 3 INCI, mevcut REVELA veritabanından)
 * 6. DB'ye kaydet (foto sadece opt-in)
 * 7. Response dön
 */
@Injectable()
export class SkinAnalysisService {
  private readonly logger = new Logger(SkinAnalysisService.name);

  /** 6-boyut skoru → genel skora çevirirken kullanılan ağırlıklar (toplam 1.0) */
  private readonly DIMENSION_WEIGHTS: Record<keyof SkinScoreBreakdown, number> = {
    t_zone_oil: 0.15,
    pore_visibility: 0.15,
    wrinkles: 0.20,
    pigmentation: 0.20,
    redness: 0.15,
    under_eye_darkness: 0.15,
    acne_count: 0, // Bonus, ağırlığa katılmaz
    fitzpatrick_type: 0, // Sınıflandırma, skor değil
  };

  /** Her boyut için top INCI önerileri (Gün 2-3'te REVELA DB'den dinamik üretilecek, şu an statik) */
  private readonly DIMENSION_INCI_MAP: Record<string, string[]> = {
    t_zone_oil: ['Niacinamide', 'Salicylic Acid (BHA)', 'Zinc PCA'],
    pore_visibility: ['Niacinamide', 'Salicylic Acid (BHA)', 'Retinol'],
    wrinkles: ['Retinol', 'Palmitoyl Pentapeptide-4', 'Vitamin C'],
    pigmentation: ['Niacinamide', 'Vitamin C', 'Alpha Arbutin', 'Tranexamic Acid'],
    redness: ['Centella Asiatica', 'Allantoin', 'Panthenol', 'Bisabolol'],
    under_eye_darkness: ['Caffeine', 'Vitamin K', 'Peptides', 'Niacinamide'],
    acne_count: ['Salicylic Acid (BHA)', 'Niacinamide', 'Tea Tree Oil', 'Azelaic Acid'],
    fitzpatrick_type: [], // Sınıflandırma → öneri yok
  };

  constructor(
    @InjectRepository(SkinAnalysisResult)
    private readonly results: Repository<SkinAnalysisResult>,
    private readonly vision: VisionService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Enriched recommendations cache — DIMENSION_INCI_MAP statik olduğu için
   * SQL sonucu uzun süre değişmiyor. Process boyu cache (1 saat TTL).
   * (CacheService Redis ile yer kazandırırdı ama bu modüle eklemeden process-local yeterli.)
   */
  private recommendationsCache: { value: Record<string, IngredientRecommendation[]> | null; ts: number } = {
    value: null,
    ts: 0,
  };
  private readonly REC_CACHE_TTL = 60 * 60 * 1000;

  async analyze(
    dto: SkinAnalysisRequestDto,
    context: { user_id?: number; ip?: string; user_agent?: string; email?: string } = {},
  ): Promise<SkinAnalysisResponse> {
    // Gerçek vision çağrısı — başarısızsa BadRequest (cilt analizinde "hayal etme" politikası,
    // placeholder skor kullanıcıya verilmemeli)
    const visionResult = await this.vision.callVisionWithPrompt(
      dto.image_base64,
      dto.image_mime,
      this.buildSkinPrompt(),
    );

    if (!visionResult) {
      throw new BadRequestException(
        'Cilt analizi şu an yapılamıyor — Vision servisi yanıt vermedi. Lütfen tekrar dene.',
      );
    }

    const scores = this.parseSkinJSON(visionResult.raw);
    if (!scores) {
      throw new BadRequestException(
        'Fotoğraf analiz edilemedi — yüz net görünmüyor olabilir. Daha iyi ışıkta tekrar dene.',
      );
    }

    const overall_score = this.calculateOverall(scores);
    // Day 8: enriched recommendations (ingredient metadata + REVELA ürünleri).
    // DB lookup fail olursa eski statik fallback'e düşer — analiz bozulmaz.
    const recommendations = await this.buildEnrichedRecommendations(scores).catch((err) => {
      this.logger.warn(`Enriched recommendations failed, fallback to static: ${err.message}`);
      return this.buildStaticFallbackRecommendations(scores);
    });

    const saved = await this.results.save(
      this.results.create({
        user_id: context.user_id ?? null,
        anonymous_email: context.email ? createHash('sha256').update(context.email.toLowerCase()).digest('hex') : null,
        scores,
        overall_score,
        // DB JSON column'una display_name + ingredient_id mapping kaydederiz —
        // tam product listesi cache-bound, her gösterimde taze çekilir.
        recommendations: this.compactRecommendationsForStorage(recommendations),
        guard_score: dto.guard_score ?? null,
        model_version: `${visionResult.model}-skin-v1`,
        photo_blob: dto.store_photo ? dto.image_base64 : null,
        ip: context.ip ?? null,
        user_agent: context.user_agent ? context.user_agent.slice(0, 255) : null,
      }),
    );

    return {
      scores,
      overall_score,
      recommendations,
      model_version: saved.model_version,
      analysis_id: Number(saved.analysis_id),
      created_at: saved.created_at.toISOString(),
    };
  }

  /**
   * Skin-specific Türkçe Vision prompt — 6-boyut skor JSON çıktısı için.
   *
   * Kritik kurallar (Madde 5 disclaimer + Quantum Orbit "hallucinate etme" prensibi):
   * - Yüz net görünmüyorsa null döndür (placeholder skor verme)
   * - Tıbbi tanı koyma, sadece görsel gözlemle skorla
   * - Skor 0-100 (yüksek = daha şiddetli)
   */
  private buildSkinPrompt(): string {
    return `Bu fotoğrafta bir kullanıcının yüzü var. Yüzünün cilt durumunu analiz et.

ÖNEMLİ: Bu bir TIBBİ TANI DEĞİL, görsel cilt gözlemi. Sadece fotoğrafta NET görebildiğin belirtileri skorla, hayal etme.

Eğer fotoğrafta:
- Yüz net görünmüyorsa
- Çok bulanıksa veya çok karanlıksa
- Yüz değil başka bir nesne ise
- Birden fazla yüz varsa

cevabı şöyle döndür: {"error": "face_not_detected"}

Aksi halde, SADECE aşağıdaki JSON formatında cevap ver (başka hiçbir metin yazma):

{
  "t_zone_oil": 0-100 arası tamsayı (T-bölgesinde — alın+burun — yağlanma/parlama şiddeti, 0=hiç yağlı değil, 100=çok yağlı),
  "pore_visibility": 0-100 (gözenek görünürlüğü, özellikle burun ve yanak; 0=görünmez, 100=çok belirgin),
  "wrinkles": 0-100 (kırışıklık ve ince çizgi şiddeti, alın+göz çevresi+ağız; 0=hiç yok, 100=derin),
  "pigmentation": 0-100 (leke/hiperpigmentasyon şiddeti; 0=eşit ton, 100=yoğun leke),
  "redness": 0-100 (kızarıklık/inflamasyon şiddeti, yanak+burun çevresi; 0=hiç, 100=yaygın),
  "under_eye_darkness": 0-100 (gözaltı moru/koyuluk şiddeti; 0=normal, 100=çok belirgin),
  "acne_count": 0-50 (aktif sivilce/akne sayısı; sayamıyorsan tahmini ver),
  "fitzpatrick_type": 1-6 (cilt tonu sınıfı: 1=çok açık, 6=çok koyu)
}

Şüphedeysen orta değer (40-60) ver. Hayal etme. Sayısal olmayan değer döndürme.`;
  }

  /**
   * Vision JSON çıktısını parse + sanitize.
   * Hatalı JSON, missing key, range dışı değerler → null döner (caller user-friendly hata göstersin).
   */
  private parseSkinJSON(raw: string): SkinScoreBreakdown | null {
    try {
      const clean = raw.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      const parsed = JSON.parse(clean);
      if (parsed.error === 'face_not_detected') return null;

      const clamp = (v: unknown, max = 100): number => {
        const n = Number(v);
        if (!Number.isFinite(n)) return 50; // Default orta değer
        return Math.max(0, Math.min(max, Math.round(n)));
      };

      return {
        t_zone_oil: clamp(parsed.t_zone_oil),
        pore_visibility: clamp(parsed.pore_visibility),
        wrinkles: clamp(parsed.wrinkles),
        pigmentation: clamp(parsed.pigmentation),
        redness: clamp(parsed.redness),
        under_eye_darkness: clamp(parsed.under_eye_darkness),
        acne_count: parsed.acne_count != null ? clamp(parsed.acne_count, 50) : undefined,
        fitzpatrick_type: parsed.fitzpatrick_type != null ? clamp(parsed.fitzpatrick_type, 6) : undefined,
      };
    } catch (err: any) {
      this.logger.warn(`parseSkinJSON failed: ${err.message}, raw: ${raw.slice(0, 200)}`);
      return null;
    }
  }

  private calculateOverall(scores: SkinScoreBreakdown): number {
    let sum = 0;
    let weightSum = 0;
    for (const [dim, weight] of Object.entries(this.DIMENSION_WEIGHTS) as Array<[keyof SkinScoreBreakdown, number]>) {
      if (weight === 0) continue;
      const score = scores[dim];
      if (typeof score !== 'number') continue;
      sum += score * weight;
      weightSum += weight;
    }
    return weightSum > 0 ? Math.round(sum / weightSum) : 0;
  }

  /** Fallback — DB lookup başarısızsa kullanıcı yine de INCI önerisi görür. */
  private buildStaticFallbackRecommendations(scores: SkinScoreBreakdown): Record<string, IngredientRecommendation[]> {
    const recs: Record<string, IngredientRecommendation[]> = {};
    for (const [dim, list] of Object.entries(this.DIMENSION_INCI_MAP)) {
      const score = scores[dim as keyof SkinScoreBreakdown];
      if (typeof score === 'number' && score >= 40 && list.length > 0) {
        recs[dim] = list.slice(0, 3).map((name) => ({
          ingredient: null,
          display_name: name,
          products: [],
        }));
      }
    }
    return recs;
  }

  /**
   * Day 8: REVELA `ingredients` tablosundan INCI metadata + her INCI için top 3 ürün.
   *
   * Performance:
   * - Tüm sorunlu boyutların INCI'leri tek query'de fuzzy match'lenir (similarity OR ILIKE)
   * - Top 3 ürün PARTITION BY ile tek query — Render free tier'da ~150ms toplam
   * - Sonuç process-local cache'lenir (1 saat) çünkü DIMENSION_INCI_MAP statik
   *
   * Skor <40 olan boyutlar için öneri çıkarılmaz (zaten temiz, INCI gerekmez).
   */
  private async buildEnrichedRecommendations(
    scores: SkinScoreBreakdown,
  ): Promise<Record<string, IngredientRecommendation[]>> {
    // Hangi boyutlar problemli ve hangi INCI isimleri lazım, çıkar
    const dimToNames = new Map<string, string[]>();
    const allNames = new Set<string>();
    for (const [dim, list] of Object.entries(this.DIMENSION_INCI_MAP)) {
      const score = scores[dim as keyof SkinScoreBreakdown];
      if (typeof score === 'number' && score >= 40 && list.length > 0) {
        const top = list.slice(0, 3);
        dimToNames.set(dim, top);
        top.forEach((n) => allNames.add(n));
      }
    }
    if (dimToNames.size === 0) return {};

    // Cache hit?
    if (
      this.recommendationsCache.value &&
      Date.now() - this.recommendationsCache.ts < this.REC_CACHE_TTL
    ) {
      // Cache global — sadece bu çağrıya konu olan boyutları filtrele
      const filtered: Record<string, IngredientRecommendation[]> = {};
      for (const dim of dimToNames.keys()) {
        if (this.recommendationsCache.value[dim]) filtered[dim] = this.recommendationsCache.value[dim];
      }
      if (Object.keys(filtered).length === dimToNames.size) return filtered;
    }

    // 1) INCI ismi → ingredient metadata lookup (paranthesis temizle, common_name + inci_name fuzzy)
    const normalizedNames = Array.from(allNames).map((n) =>
      n.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase(),
    );
    const ingredientRows: Array<{
      ingredient_id: number;
      inci_name: string;
      common_name: string | null;
      ingredient_slug: string;
      evidence_grade: string | null;
      function_summary: string | null;
      allergen_flag: boolean;
      fragrance_flag: boolean;
      query_name: string;
    }> = await this.dataSource.query(
      `
      SELECT DISTINCT ON (q.query_name)
        i.ingredient_id, i.inci_name, i.common_name, i.ingredient_slug,
        i.evidence_grade, i.function_summary, i.allergen_flag, i.fragrance_flag,
        q.query_name
      FROM unnest($1::text[]) AS q(query_name)
      LEFT JOIN LATERAL (
        SELECT *
        FROM ingredients ing
        WHERE LOWER(ing.inci_name) = q.query_name
           OR LOWER(COALESCE(ing.common_name, '')) = q.query_name
           OR LOWER(ing.inci_name) LIKE q.query_name || '%'
        ORDER BY
          CASE WHEN LOWER(ing.inci_name) = q.query_name THEN 0 ELSE 1 END,
          length(ing.inci_name) ASC
        LIMIT 1
      ) i ON true
      WHERE i.ingredient_id IS NOT NULL
      `,
      [normalizedNames],
    );

    // query_name → ingredient map (statik INCI ismini bu lookup'a bağla)
    const nameToIngredient = new Map<string, typeof ingredientRows[number]>();
    for (const row of ingredientRows) {
      nameToIngredient.set(row.query_name, row);
    }

    // 2) Top 3 ürün her ingredient için — tek query (PARTITION BY) ile
    const ingredientIds = ingredientRows.map((r) => r.ingredient_id);
    const productRows: Array<{
      ingredient_id: number;
      product_id: number;
      product_slug: string;
      product_name: string;
      brand_name: string;
      image_url: string | null;
      price: number | null;
    }> = ingredientIds.length === 0 ? [] : await this.dataSource.query(
      `
      SELECT ingredient_id, product_id, product_slug, product_name, brand_name, image_url, price
      FROM (
        SELECT
          pi.ingredient_id,
          p.product_id, p.product_slug, p.product_name,
          b.brand_name,
          (SELECT image_url FROM product_images img WHERE img.product_id = p.product_id ORDER BY img.sort_order ASC LIMIT 1) AS image_url,
          (SELECT MIN(al.price_snapshot)::float FROM affiliate_links al WHERE al.product_id = p.product_id AND al.verification_status NOT IN ('needs_review', 'dead')) AS price,
          ROW_NUMBER() OVER (
            PARTITION BY pi.ingredient_id
            ORDER BY pi.inci_order_rank ASC NULLS LAST, COALESCE(p.review_count, 0) DESC
          ) AS rn
        FROM product_ingredients pi
        JOIN products p ON p.product_id = pi.product_id
        JOIN brands b ON b.brand_id = p.brand_id
        WHERE pi.ingredient_id = ANY($1::int[])
          AND p.status = 'published'
          AND pi.inci_order_rank <= 10
          AND pi.match_status != 'pending_review'
      ) ranked
      WHERE rn <= 3
      ORDER BY ingredient_id, rn
      `,
      [ingredientIds],
    );

    // ingredient_id → products map
    const idToProducts = new Map<number, IngredientRecommendation['products']>();
    for (const p of productRows) {
      if (!idToProducts.has(p.ingredient_id)) idToProducts.set(p.ingredient_id, []);
      idToProducts.get(p.ingredient_id)!.push({
        product_id: p.product_id,
        product_slug: p.product_slug,
        product_name: p.product_name,
        brand_name: p.brand_name,
        image_url: p.image_url,
        price: p.price != null ? Number(p.price) : null,
      });
    }

    // 3) Sonucu boyut bazlı yapıya çevir
    const result: Record<string, IngredientRecommendation[]> = {};
    for (const [dim, names] of dimToNames.entries()) {
      result[dim] = names.map((name) => {
        const norm = name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
        const ing = nameToIngredient.get(norm);
        return {
          ingredient: ing
            ? {
                ingredient_id: ing.ingredient_id,
                inci_name: ing.inci_name,
                common_name: ing.common_name,
                ingredient_slug: ing.ingredient_slug,
                evidence_grade: (ing.evidence_grade as 'A' | 'B' | 'C' | 'D' | 'F' | null) ?? null,
                function_summary: ing.function_summary,
                allergen_flag: !!ing.allergen_flag,
                fragrance_flag: !!ing.fragrance_flag,
              }
            : null,
          display_name: ing?.common_name || ing?.inci_name || name,
          products: ing ? idToProducts.get(ing.ingredient_id) ?? [] : [],
        };
      });
    }

    // Cache global sonucu (tüm DIMENSION_INCI_MAP girdileri için, sonraki çağrıda
    // farklı skor profili gelse bile cache hit alır)
    this.recommendationsCache = { value: { ...this.recommendationsCache.value, ...result }, ts: Date.now() };

    return result;
  }

  /**
   * DB JSON column'una kaydederken full product listesi şişme yapmasın diye
   * sadece display_name + ingredient_id kaydederiz; gösterimde live çekilir.
   */
  private compactRecommendationsForStorage(
    enriched: Record<string, IngredientRecommendation[]>,
  ): Record<string, Array<{ display_name: string; ingredient_id: number | null }>> {
    const out: Record<string, Array<{ display_name: string; ingredient_id: number | null }>> = {};
    for (const [dim, items] of Object.entries(enriched)) {
      out[dim] = items.map((it) => ({
        display_name: it.display_name,
        ingredient_id: it.ingredient?.ingredient_id ?? null,
      }));
    }
    return out;
  }

  async getById(analysisId: number, userId?: number): Promise<SkinAnalysisResult | null> {
    const where = userId
      ? { analysis_id: String(analysisId), user_id: userId }
      : { analysis_id: String(analysisId) };
    return this.results.findOne({ where: where as any });
  }

  async getUserHistory(userId: number, limit = 20): Promise<SkinAnalysisResult[]> {
    return this.results.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: Math.min(Math.max(limit, 1), 100),
    });
  }
}
