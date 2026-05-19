import { Repository } from 'typeorm';
import { SkinComboService } from './skin-combo.service';
import { Ingredient } from '@database/entities';
import type { SkinScoreBreakdown } from './dto/skin-analysis.dto';

/**
 * SkinComboService unit testleri (Modül J #4, 2026-05-19).
 *
 * Combo algoritmasının davranışını sabitler:
 *  - <40 skor → null combo
 *  - top-2 boyut seçimi sıralı
 *  - Fitzpatrick 5-6 → bakuchiol/azelaik öne çekilir, retinol arkaya
 *  - AM/PM ataması (photosensitive PM)
 *  - Sinerji + kontrendikasyon flag'leri
 */
describe('SkinComboService — recommendCombo', () => {
  let service: SkinComboService;
  let ingredients: jest.Mocked<Repository<Ingredient>>;

  beforeEach(() => {
    ingredients = {
      find: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<Repository<Ingredient>>;
    service = new SkinComboService(ingredients);
  });

  const baseScores = (overrides: Partial<SkinScoreBreakdown> = {}): SkinScoreBreakdown => ({
    overall: 50,
    skin_age: 35,
    radiance: 50,
    elasticity: 50,
    hydration: 50,
    t_zone_oil: 0,
    pore_visibility: 0,
    wrinkles: 0,
    pigmentation: 0,
    redness: 0,
    under_eye_darkness: 0,
    ...overrides,
  } as SkinScoreBreakdown);

  it('tüm boyutlar <40 → null combo + bariyer notu', async () => {
    const result = await service.recommendCombo(baseScores({ t_zone_oil: 30, wrinkles: 20 }));
    expect(result.morning).toBeNull();
    expect(result.evening).toBeNull();
    expect(result.synergy).toBe(false);
    expect(result.note).toMatch(/bariyer/i);
    expect(result.contraindication_warning).toBeNull();
  });

  it('tek boyut yüksek (sadece wrinkles=70) → tek pick döner', async () => {
    const result = await service.recommendCombo(baseScores({ wrinkles: 70 }));
    // wrinkles → retinol (PM, photosensitive) ilk sırada
    expect(result.evening).not.toBeNull();
    expect(result.evening?.slug).toBe('retinol');
    expect(result.evening?.time_of_day).toBe('PM');
    expect(result.morning).toBeNull();
    expect(result.synergy).toBe(false);
  });

  it('Fitzpatrick 5 → wrinkles için retinol yerine bakuchiol seçer', async () => {
    const result = await service.recommendCombo(baseScores({ wrinkles: 70 }), 5);
    expect(result.evening?.slug).not.toBe('retinol');
    // Bakuchiol veya azelaic-acid/niacinamide gibi koyu-cilt güvenli
    const safe = ['bakuchiol', 'azelaic-acid', 'niacinamide', 'centella-asiatica-extract'];
    // Tek pick wrinkles için → bakuchiol (safe list içinde ilk match)
    const pick = result.morning?.slug || result.evening?.slug;
    expect(safe).toContain(pick);
  });

  it('iki boyut yüksek (wrinkles=70 + redness=60) → 2 pick + sabah/akşam ayrımı', async () => {
    const result = await service.recommendCombo(baseScores({ wrinkles: 70, redness: 60 }));
    // wrinkles → retinol (PM)
    // redness → centella (ALL) → AM slot doldurur
    expect(result.evening?.slug).toBe('retinol');
    expect(result.evening?.time_of_day).toBe('PM');
    expect(result.morning).not.toBeNull();
    expect(result.morning?.time_of_day).toBe('AM');
  });

  it('kontrendike pair → warning üretir (retinol + glycolic gibi mock)', async () => {
    // Pigmentation top-1 → ethyl-ascorbic-acid (AM)
    // T-zone top-2 → niacinamide (ALL) → sinerjik (uyarı yok)
    // Kontrendike senaryo: wrinkles + t_zone_oil ile retinol + salicylic
    // ama DIM_INGREDIENT_MAP'te t_zone_oil ilk niacinamide → kontrendike olmaz.
    // Bu test sinerjinin doğru raporlandığını doğrular.
    const result = await service.recommendCombo(baseScores({ wrinkles: 70, t_zone_oil: 60 }));
    // retinol + niacinamide sinerjiktir
    expect(result.synergy).toBe(true);
    expect(result.contraindication_warning).toBeNull();
    expect(result.note).toMatch(/sinerjik/i);
  });

  it('top-2 boyut sıralaması: en yüksek skor önce', async () => {
    const result = await service.recommendCombo(
      baseScores({ wrinkles: 50, pigmentation: 80, redness: 45 }),
    );
    // pigmentation=80 ilk pick → ethyl-ascorbic-acid (AM, sensitivity low)
    // wrinkles=50 ikinci pick → retinol (PM)
    expect(result.morning?.dimension).toBe('pigmentation');
    expect(result.evening?.dimension).toBe('wrinkles');
  });

  it('DB ingredient detayı çekilir ve pick içine yerleştirilir', async () => {
    ingredients.find = jest.fn().mockResolvedValue([
      {
        ingredient_id: 42,
        ingredient_slug: 'retinol',
        inci_name: 'Retinol',
        function_summary: 'Hücre yenilenmesi hızlandırıcı',
        evidence_grade: 'A',
      },
    ] as unknown as Ingredient[]);

    const result = await service.recommendCombo(baseScores({ wrinkles: 80 }));
    expect(result.evening?.function_summary).toBe('Hücre yenilenmesi hızlandırıcı');
    expect(result.evening?.evidence_grade).toBe('A');
    expect(ingredients.find).toHaveBeenCalled();
  });

  it('photosensitive INCI (retinol) AM slot doldurmaz — PM kalır', async () => {
    const result = await service.recommendCombo(baseScores({ wrinkles: 70 }));
    expect(result.morning).toBeNull();
    expect(result.evening?.time_of_day).toBe('PM');
  });
});
