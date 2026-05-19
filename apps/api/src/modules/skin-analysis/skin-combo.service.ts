import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ingredient } from '@database/entities';
import type { SkinScoreBreakdown } from './dto/skin-analysis.dto';

/**
 * Modül J — Senin Cildine Combo (2026-05-19).
 *
 * Cilt analizi (foto veya quiz) sonucundan en yüksek 2 sorunlu boyut için
 * **uyumlu** 2 aktif INCI önerisi üretir. Önceki MVP iskelet (964699e)
 * sadece skor sıralaması + sahte sabah/akşam etiketi yapıyordu; bu service
 * gerçek logic ekler:
 *
 *  1. Cilt skoru → top-2 sorunlu boyut (≥40 skor)
 *  2. Her boyut için boyut → INCI eşleme (DIM_INGREDIENT_MAP)
 *  3. Cilt tipi (Fitzpatrick) + hassasiyet filtre (FITZPATRICK_PREFER)
 *  4. Sinerji + kontrendikasyon kontrolü (INCI_PROFILE.contra/synergy)
 *  5. Sabah/akşam ayrımı (photosensitivity, AM/PM, ALL flag)
 *  6. DB'den ingredient detayını çek (slug + function_summary + evidence_grade)
 *
 * Output:
 *  - 2 ingredient slug + display_name + ingredient detail
 *  - morning_slug / evening_slug ayrımı
 *  - synergy_note + contraindication_warning (varsa)
 */

export type TimeOfDay = 'AM' | 'PM' | 'ALL';
export type SensitivityLevel = 'low' | 'medium' | 'high';

interface InciProfile {
  /** Ne zaman kullanılır: AM=sabah, PM=akşam, ALL=her ikisi */
  time: TimeOfDay;
  /** Fotosensitif (gündüz SPF + akşam kullanım tercih) */
  photosensitive: boolean;
  /** İritasyon riski */
  sensitivity: SensitivityLevel;
  /** Bu INCI ile birlikte kullanılmaması gerekenler */
  contra: string[];
  /** Bu INCI ile sinerjik çalışanlar */
  synergy: string[];
  /** Display name (TR) */
  display_name: string;
}

/**
 * INCI profil tablosu — ileride DB'ye taşınabilir. Şimdilik hard-coded
 * Modül H'deki niche INCI'leri + en yaygın aktifleri kapsar.
 */
const INCI_PROFILE: Record<string, InciProfile> = {
  // Retinoidler
  'retinol': { time: 'PM', photosensitive: true, sensitivity: 'high',
    contra: ['glycolic-acid', 'salicylic-acid', 'lactic-acid', 'ascorbic-acid'],
    synergy: ['sodium-hyaluronate', 'sodium-hyaluronate-crosspolymer', 'niacinamide', 'palmitoyl-pentapeptide-4'],
    display_name: 'Retinol' },
  'bakuchiol': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['niacinamide', 'sodium-hyaluronate', 'ceramides'],
    display_name: 'Bakuchiol' },

  // C Vitamini Türevleri
  'ascorbic-acid': { time: 'AM', photosensitive: false, sensitivity: 'medium',
    contra: ['retinol', 'glycolic-acid'],
    synergy: ['vitamin-e', 'ferulic-acid', 'niacinamide'],
    display_name: 'L-Askorbik Asit' },
  'ethyl-ascorbic-acid': { time: 'AM', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['niacinamide', 'sodium-hyaluronate'],
    display_name: 'Etil Askorbik Asit' },
  'tetrahexyldecyl-ascorbate': { time: 'AM', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['vitamin-e', 'niacinamide'],
    display_name: 'Tetrahexyldecyl Askorbat' },

  // B3 + Peptit
  'niacinamide': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['retinol', 'sodium-hyaluronate', 'ascorbic-acid', 'bakuchiol'],
    display_name: 'Niacinamide' },
  'palmitoyl-pentapeptide-4': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['sodium-hyaluronate', 'retinol', 'ceramides'],
    display_name: 'Palmitoyl Pentapeptide-4 (Matrixyl)' },
  'acetyl-hexapeptide-8': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['sodium-hyaluronate', 'niacinamide'],
    display_name: 'Argireline (Asetil Heksapeptid-8)' },

  // AHA / BHA — keratolitik
  'glycolic-acid': { time: 'PM', photosensitive: true, sensitivity: 'high',
    contra: ['retinol', 'salicylic-acid', 'ascorbic-acid'],
    synergy: ['sodium-hyaluronate', 'niacinamide'],
    display_name: 'Glikolik Asit (AHA)' },
  'salicylic-acid': { time: 'PM', photosensitive: true, sensitivity: 'medium',
    contra: ['retinol', 'glycolic-acid'],
    synergy: ['niacinamide', 'azelaic-acid'],
    display_name: 'Salisilik Asit (BHA)' },
  'lactic-acid': { time: 'PM', photosensitive: true, sensitivity: 'medium',
    contra: ['retinol'], synergy: ['sodium-hyaluronate', 'niacinamide'],
    display_name: 'Laktik Asit' },

  // Azelaik + Antiinflamatuar
  'azelaic-acid': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['niacinamide', 'salicylic-acid'],
    display_name: 'Azelaik Asit' },

  // Nem + Bariyer
  'sodium-hyaluronate': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['retinol', 'niacinamide', 'ceramides'],
    display_name: 'Sodyum Hiyalüronat' },
  'sodium-hyaluronate-crosspolymer': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['retinol', 'niacinamide'],
    display_name: 'Çapraz Bağlı Hiyalüronat' },
  'ceramides': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['niacinamide', 'bakuchiol', 'palmitoyl-pentapeptide-4'],
    display_name: 'Seramidler' },

  // Antioksidan
  'resveratrol-cosmetic': { time: 'AM', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['niacinamide', 'ascorbic-acid'],
    display_name: 'Resveratrol' },
  'ergothioneine': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['niacinamide'],
    display_name: 'Ergotionein' },

  // Botanik
  'centella-asiatica-extract': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['ceramides', 'niacinamide'],
    display_name: 'Cica (Centella)' },
  'scutellaria-baicalensis-extract': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['niacinamide'],
    display_name: 'Bayağı Kafa Otu Ekstresi' },
  'epilobium-angustifolium-extract': { time: 'ALL', photosensitive: false, sensitivity: 'low',
    contra: [], synergy: ['azelaic-acid', 'salicylic-acid'],
    display_name: 'Yakı Otu (Willowherb)' },
};

/**
 * Cilt skoru boyutu → o boyutu adresleyen INCI listesi (öncelik sırası önemli).
 * "Yüksek skor = sorun" olduğu için, her boyut için en kanıt-temelli INCI'ler
 * baştan listelenir.
 */
const DIM_INGREDIENT_MAP: Record<string, string[]> = {
  t_zone_oil: ['niacinamide', 'salicylic-acid', 'azelaic-acid', 'epilobium-angustifolium-extract'],
  pore_visibility: ['niacinamide', 'salicylic-acid', 'retinol', 'bakuchiol'],
  wrinkles: ['retinol', 'bakuchiol', 'palmitoyl-pentapeptide-4', 'acetyl-hexapeptide-8', 'resveratrol-cosmetic'],
  pigmentation: ['ethyl-ascorbic-acid', 'tetrahexyldecyl-ascorbate', 'azelaic-acid', 'niacinamide', 'ascorbic-acid'],
  redness: ['centella-asiatica-extract', 'azelaic-acid', 'niacinamide', 'scutellaria-baicalensis-extract'],
  under_eye_darkness: ['niacinamide', 'tetrahexyldecyl-ascorbate', 'ethyl-ascorbic-acid', 'palmitoyl-pentapeptide-4'],
};

/**
 * Fitzpatrick tipine göre tercih edilen INCI'ler.
 * 5-6 (koyu) ciltler: PIH riski yüksek → retinol yerine bakuçiol/azelaik,
 * AHA/BHA agresif olduğu için düşük doz tercih.
 * 1-2 (çok açık): rosacea + hassasiyet daha yaygın → niacinamide + bakuchiol tercih.
 */
function applyFitzpatrickPreference(candidates: string[], fitzpatrick?: number | null): string[] {
  if (!fitzpatrick) return candidates;
  if (fitzpatrick >= 5) {
    // Koyu cilt: retinol/AHA/BHA arkaya at, bakuchiol/azelaik/niacinamide öne çek
    const safe = ['bakuchiol', 'azelaic-acid', 'niacinamide', 'centella-asiatica-extract'];
    return [
      ...candidates.filter((c) => safe.includes(c)),
      ...candidates.filter((c) => !safe.includes(c) && c !== 'retinol' && c !== 'glycolic-acid'),
      ...candidates.filter((c) => c === 'retinol' || c === 'glycolic-acid'),
    ];
  }
  if (fitzpatrick <= 2) {
    // Çok açık cilt: hassasiyet yüksek, sensitivity:'low' olanları öne çek
    return candidates.sort((a, b) => {
      const sa = INCI_PROFILE[a]?.sensitivity === 'low' ? 0 : 1;
      const sb = INCI_PROFILE[b]?.sensitivity === 'low' ? 0 : 1;
      return sa - sb;
    });
  }
  return candidates;
}

export interface ComboPick {
  slug: string;
  display_name: string;
  dimension: string;
  dimension_score: number;
  time_of_day: 'AM' | 'PM';
  function_summary?: string | null;
  evidence_grade?: string | null;
  product?: {
    product_id: number;
    product_name: string;
    product_slug: string;
    brand_name: string | null;
  } | null;
}

export interface ComboResult {
  morning: ComboPick | null;
  evening: ComboPick | null;
  /** İki INCI sinerjik mi (synergy listesinde) */
  synergy: boolean;
  /** Kullanıcıya gösterilebilir not */
  note: string;
  /** Kontrendike pair'ler için uyarı (boş = sorun yok) */
  contraindication_warning: string | null;
}

@Injectable()
export class SkinComboService {
  constructor(
    @InjectRepository(Ingredient) private readonly ingredients: Repository<Ingredient>,
  ) {}

  /**
   * Cilt skoru + opsiyonel cilt tipi/hassasiyet → 2-serum combo öner.
   *
   * Algoritma:
   *  1. Skoru ≥40 olan boyutları sırala, top-2 al
   *  2. Her boyut için INCI havuzunu Fitzpatrick'e göre filtrele
   *  3. İlk pick = en yüksek skor boyut, ilk uyumlu INCI
   *  4. İkinci pick = ikinci skor boyut, ilk INCI'nin contra listesinde
   *     olmayan ve synergy listesinde olanı tercih et
   *  5. AM/PM ata: photosensitive → PM, ALL → boş slot doldur, AM → sabah
   *  6. DB'den ingredient detayını çek (function_summary + evidence_grade)
   */
  async recommendCombo(
    scores: SkinScoreBreakdown,
    fitzpatrick?: number | null,
  ): Promise<ComboResult> {
    // 1. Top-2 sorunlu boyut
    const dims: Array<{ dim: string; score: number }> = [
      { dim: 't_zone_oil', score: Number(scores.t_zone_oil) || 0 },
      { dim: 'pore_visibility', score: Number(scores.pore_visibility) || 0 },
      { dim: 'wrinkles', score: Number(scores.wrinkles) || 0 },
      { dim: 'pigmentation', score: Number(scores.pigmentation) || 0 },
      { dim: 'redness', score: Number(scores.redness) || 0 },
      { dim: 'under_eye_darkness', score: Number(scores.under_eye_darkness) || 0 },
    ]
      .filter((d) => d.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    if (dims.length < 1) {
      return {
        morning: null,
        evening: null,
        synergy: false,
        note: 'Tüm boyutlar 40 altında — combo önerisi gerekmiyor. Bariyer + nem rutini yeterli.',
        contraindication_warning: null,
      };
    }

    // 2. İlk pick
    const firstCandidates = applyFitzpatrickPreference(
      DIM_INGREDIENT_MAP[dims[0].dim] || [],
      fitzpatrick,
    );
    const firstSlug = firstCandidates[0];
    if (!firstSlug || !INCI_PROFILE[firstSlug]) {
      return {
        morning: null,
        evening: null,
        synergy: false,
        note: `${dims[0].dim} için aktif INCI bulunamadı.`,
        contraindication_warning: null,
      };
    }
    const firstProfile = INCI_PROFILE[firstSlug];

    // 3. İkinci pick (varsa)
    let secondSlug: string | null = null;
    if (dims.length > 1) {
      const secondCandidates = applyFitzpatrickPreference(
        DIM_INGREDIENT_MAP[dims[1].dim] || [],
        fitzpatrick,
      );
      // Önce sinerjik olanı, sonra contra olmayanı
      secondSlug =
        secondCandidates.find((s) => firstProfile.synergy.includes(s)) ||
        secondCandidates.find((s) => s !== firstSlug && !firstProfile.contra.includes(s)) ||
        null;
    }

    // 4. AM/PM ata
    const assignTime = (a: InciProfile, b: InciProfile | null): { aTime: 'AM' | 'PM'; bTime: 'AM' | 'PM' | null } => {
      if (!b) return { aTime: a.time === 'PM' ? 'PM' : 'AM', bTime: null };
      // İkisi de PM ise: birini sabaha bırakmak yerine her ikisi de akşam (uyarı verilir)
      if (a.time === 'PM' && b.time === 'PM') return { aTime: 'PM', bTime: 'PM' };
      if (a.time === 'AM' && b.time === 'AM') return { aTime: 'AM', bTime: 'AM' };
      if (a.time === 'PM') return { aTime: 'PM', bTime: 'AM' };
      if (b.time === 'PM') return { aTime: 'AM', bTime: 'PM' };
      // İkisi de ALL: ilkini sabah, ikincisini akşam
      return { aTime: 'AM', bTime: 'PM' };
    };
    const secondProfile = secondSlug ? INCI_PROFILE[secondSlug] : null;
    const { aTime, bTime } = assignTime(firstProfile, secondProfile);

    // 5. DB detayını çek
    const slugs = [firstSlug, ...(secondSlug ? [secondSlug] : [])];
    const ingredients = await this.ingredients.find({
      where: { ingredient_slug: In(slugs) },
      select: ['ingredient_id', 'ingredient_slug', 'inci_name', 'function_summary', 'evidence_grade'],
    });
    const byslug = new Map(ingredients.map((i) => [i.ingredient_slug, i]));

    const buildPick = (
      slug: string,
      dim: string,
      dimScore: number,
      time: 'AM' | 'PM',
      profile: InciProfile,
    ): ComboPick => {
      const ing = byslug.get(slug);
      return {
        slug,
        display_name: profile.display_name,
        dimension: dim,
        dimension_score: dimScore,
        time_of_day: time,
        function_summary: ing?.function_summary ?? null,
        evidence_grade: ing?.evidence_grade ?? null,
        product: null, // ProductMatching ayrı service, ileride entegre edilebilir
      };
    };

    const morningPick =
      aTime === 'AM' ? buildPick(firstSlug, dims[0].dim, dims[0].score, 'AM', firstProfile) :
      bTime === 'AM' && secondSlug && secondProfile ? buildPick(secondSlug, dims[1].dim, dims[1].score, 'AM', secondProfile) :
      null;

    const eveningPick =
      aTime === 'PM' ? buildPick(firstSlug, dims[0].dim, dims[0].score, 'PM', firstProfile) :
      bTime === 'PM' && secondSlug && secondProfile ? buildPick(secondSlug, dims[1].dim, dims[1].score, 'PM', secondProfile) :
      null;

    // 6. Sinerji + kontrendikasyon kontrolü
    let synergy = false;
    let contraWarning: string | null = null;
    if (secondSlug && secondProfile) {
      synergy = firstProfile.synergy.includes(secondSlug) || secondProfile.synergy.includes(firstSlug);
      if (firstProfile.contra.includes(secondSlug) || secondProfile.contra.includes(firstSlug)) {
        contraWarning = `${firstProfile.display_name} ve ${secondProfile.display_name} aynı rutinde birlikte önerilmez. Bir gün arayla kullan ya da birini sabah birini akşam ayrı uygula.`;
      }
    }

    const note = synergy
      ? `${firstProfile.display_name} + ${secondProfile?.display_name ?? '?'} klinik kanıtla sinerjik. Sabah-akşam ayrı uygula, 20-30 dk arayla.`
      : secondSlug
      ? 'İki aktif birlikte güvenli ama sinerji belgelenmemiş. Sabah-akşam ayrı uygulamayı öneririz.'
      : 'Tek aktif önerisi yeterli; ikinci aktif eklemek istersen nemlendirici + bariyer öncelikli.';

    return { morning: morningPick, evening: eveningPick, synergy, note, contraindication_warning: contraWarning };
  }
}
