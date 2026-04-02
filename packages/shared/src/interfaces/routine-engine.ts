/**
 * IRoutineEngine — Faz 2.5 Rutin Oluşturucu
 *
 * Kullanıcının cilt profiline göre sabah/akşam rutin önerileri oluşturur.
 * Ingredient etkileşim kontrolü dahil.
 */

export interface RoutineStep {
  order: number;
  step_type: string; // 'cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'active', 'eye_cream'
  product_id?: number;
  product_name?: string;
  note?: string;
}

export interface RoutineInteraction {
  ingredient_a: string;
  ingredient_b: string;
  interaction_type: 'conflict' | 'synergy' | 'order_matters';
  message: string; // e.g. "Retinol + AHA aynı akşam kullanma"
}

export interface RoutineResult {
  morning: RoutineStep[];
  evening: RoutineStep[];
  interactions: RoutineInteraction[];
  warnings: string[];
}

export interface IRoutineEngine {
  /**
   * Kullanıcının profili ve mevcut ürünlerine göre rutin oluşturur
   */
  generateRoutine(params: {
    profile_id: string;
    product_ids: number[];
    skin_type: string;
    concerns: string[];
  }): Promise<RoutineResult>;

  /**
   * İki veya daha fazla ürün arasındaki ingredient etkileşimlerini kontrol eder
   */
  checkInteractions(product_ids: number[]): Promise<RoutineInteraction[]>;

  /**
   * Mevcut rutine ürün ekleme önerisi
   */
  suggestAddition(params: {
    current_routine: RoutineResult;
    need_id: number;
  }): Promise<RoutineStep[]>;
}
