import { SkinAnalysisService } from './skin-analysis.service';

/**
 * Skin Analysis Service unit testleri — Gün 2 sprint.
 *
 * Covers:
 *   - parseSkinJSON: hatalı/eksik JSON guard
 *   - parseSkinJSON: face_not_detected error handling
 *   - parseSkinJSON: range clamp (0-100, fitzpatrick 1-6, acne 0-50)
 *   - calculateOverall: ağırlıklı ortalama
 *   - buildRecommendations: skor ≥40 olanlara INCI öner
 */
describe('SkinAnalysisService — pure logic', () => {
  // parseSkinJSON ve buildRecommendations private — fonksiyonel test için minimal mock
  let service: SkinAnalysisService;

  beforeEach(() => {
    // 6 arg: results, userActions (G10 audit), vision, dataSource (G8), mail (G9), config (G9).
    // Pure logic test'i, hiçbiri çağrılmıyor — mock yeterli.
    service = new SkinAnalysisService({} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
  });

  describe('parseSkinJSON (private, reflection ile)', () => {
    const parse = (raw: string) => (service as any).parseSkinJSON(raw);

    it("face_not_detected error'ı null döner", () => {
      expect(parse('{"error":"face_not_detected"}')).toBeNull();
    });

    it('geçersiz JSON null döner', () => {
      expect(parse('this is not json')).toBeNull();
      expect(parse('{')).toBeNull();
    });

    it('geçerli skor JSON parse eder', () => {
      const result = parse(JSON.stringify({
        t_zone_oil: 75, pore_visibility: 60, wrinkles: 40,
        pigmentation: 30, redness: 20, under_eye_darkness: 55,
        acne_count: 5, fitzpatrick_type: 3,
      }));
      expect(result).toEqual({
        t_zone_oil: 75, pore_visibility: 60, wrinkles: 40,
        pigmentation: 30, redness: 20, under_eye_darkness: 55,
        acne_count: 5, fitzpatrick_type: 3,
      });
    });

    it('100 üzeri değerleri 100 ile clamp eder', () => {
      const result = parse(JSON.stringify({
        t_zone_oil: 150, pore_visibility: 50, wrinkles: 50,
        pigmentation: 50, redness: 50, under_eye_darkness: 50,
      }));
      expect(result?.t_zone_oil).toBe(100);
    });

    it('negatif değerleri 0 ile clamp eder', () => {
      const result = parse(JSON.stringify({
        t_zone_oil: -10, pore_visibility: 50, wrinkles: 50,
        pigmentation: 50, redness: 50, under_eye_darkness: 50,
      }));
      expect(result?.t_zone_oil).toBe(0);
    });

    it('fitzpatrick 6 üzerini 6 ile clamp eder', () => {
      const result = parse(JSON.stringify({
        t_zone_oil: 50, pore_visibility: 50, wrinkles: 50,
        pigmentation: 50, redness: 50, under_eye_darkness: 50,
        fitzpatrick_type: 10,
      }));
      expect(result?.fitzpatrick_type).toBe(6);
    });

    it('acne_count 50 üzerini 50 ile clamp eder', () => {
      const result = parse(JSON.stringify({
        t_zone_oil: 50, pore_visibility: 50, wrinkles: 50,
        pigmentation: 50, redness: 50, under_eye_darkness: 50,
        acne_count: 999,
      }));
      expect(result?.acne_count).toBe(50);
    });

    it("```json markdown wrapper'ı ile JSON'ı parse eder", () => {
      const wrapped = '```json\n' + JSON.stringify({
        t_zone_oil: 30, pore_visibility: 30, wrinkles: 30,
        pigmentation: 30, redness: 30, under_eye_darkness: 30,
      }) + '\n```';
      const result = parse(wrapped);
      expect(result?.t_zone_oil).toBe(30);
    });

    it('eksik alan default 50 (orta değer) döner', () => {
      const result = parse(JSON.stringify({ t_zone_oil: 80 }));
      expect(result?.t_zone_oil).toBe(80);
      expect(result?.pore_visibility).toBe(50);
      expect(result?.redness).toBe(50);
    });
  });

  describe('calculateOverall (private)', () => {
    const calc = (s: any) => (service as any).calculateOverall(s);

    it('tüm boyutlar 50 → overall 50', () => {
      expect(calc({
        t_zone_oil: 50, pore_visibility: 50, wrinkles: 50,
        pigmentation: 50, redness: 50, under_eye_darkness: 50,
      })).toBe(50);
    });

    it('tüm boyutlar 100 → overall 100', () => {
      expect(calc({
        t_zone_oil: 100, pore_visibility: 100, wrinkles: 100,
        pigmentation: 100, redness: 100, under_eye_darkness: 100,
      })).toBe(100);
    });

    it('ağırlıklı: kırışık+leke (%20×2) dominant', () => {
      const wrinkleHeavy = calc({
        t_zone_oil: 0, pore_visibility: 0, wrinkles: 100,
        pigmentation: 100, redness: 0, under_eye_darkness: 0,
      });
      // wrinkles*0.20 + pigmentation*0.20 = 40, weightSum=1.00 → 40
      expect(wrinkleHeavy).toBe(40);
    });
  });

  describe('buildStaticFallbackRecommendations (private, Day 8)', () => {
    // Day 8'de buildRecommendations kaldırılıp enriched (DB-bound) + static fallback
    // ikilisine dönüştü. Bu test fallback path'i: DB lookup fail olduğunda kullanıcı
    // yine ingredient: null + display_name + products: [] olarak görür.
    const build = (s: any) => (service as any).buildStaticFallbackRecommendations(s);

    it('skor <40 → öneri yok', () => {
      const recs = build({
        t_zone_oil: 30, pore_visibility: 25, wrinkles: 20,
        pigmentation: 35, redness: 15, under_eye_darkness: 10,
      });
      expect(Object.keys(recs)).toHaveLength(0);
    });

    it('skor ≥40 → top 3 IngredientRecommendation döner (DB metadata null fallback)', () => {
      const recs = build({
        t_zone_oil: 75, pore_visibility: 30, wrinkles: 30,
        pigmentation: 60, redness: 30, under_eye_darkness: 30,
      });
      expect(recs.t_zone_oil).toHaveLength(3);
      expect(recs.t_zone_oil[0]).toMatchObject({
        ingredient: null,
        display_name: 'Niacinamide',
        products: [],
      });
      expect(recs.pigmentation.map((r: any) => r.display_name)).toContain('Vitamin C');
      expect(recs.wrinkles).toBeUndefined(); // 30 < 40
    });

    it('acne_count ≥40 → akne öneri (sadece sorunlu boyutlar)', () => {
      const recs = build({
        t_zone_oil: 30, pore_visibility: 30, wrinkles: 30,
        pigmentation: 30, redness: 30, under_eye_darkness: 30,
        acne_count: 45,
      });
      expect(recs.acne_count.map((r: any) => r.display_name)).toContain('Salicylic Acid (BHA)');
    });
  });
});
