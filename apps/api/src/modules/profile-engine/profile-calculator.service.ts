import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface QuizAnswers {
  skin_type?: string;
  skin_concerns?: string[];
  allergies?: number[];
  pregnancy?: string;
  age_group?: string;
  climate?: string;
  routine_complexity?: string;
  ethical?: { vegan?: boolean; cruelty_free?: boolean; halal?: boolean };
  budget?: string;
  hair_type?: string;
  supplement_goals?: string[];
}

export interface UserProfile {
  skin_type_detailed: string | null;
  skin_concerns: string[];
  allergy_ingredient_ids: number[];
  pregnancy_status: string | null;
  age_group: string | null;
  climate_preference: string | null;
  budget_tier: string | null;
  ethical_preferences: Record<string, boolean>;
  routine_complexity: string | null;
  hair_type: string | null;
  supplement_goals: string[];
}

/**
 * Quiz cevapları → profil hesaplama.
 * v1: direkt map, heuristik yok. v2'de ağırlıklı skor.
 */
@Injectable()
export class ProfileCalculatorService {
  constructor(private readonly dataSource: DataSource) {}

  fromAnswers(answers: QuizAnswers): UserProfile {
    return {
      skin_type_detailed: answers.skin_type || null,
      skin_concerns: answers.skin_concerns || [],
      allergy_ingredient_ids: answers.allergies || [],
      pregnancy_status: answers.pregnancy || null,
      age_group: answers.age_group || null,
      climate_preference: answers.climate || null,
      budget_tier: answers.budget || null,
      ethical_preferences: answers.ethical || {},
      routine_complexity: answers.routine_complexity || null,
      hair_type: answers.hair_type || null,
      supplement_goals: answers.supplement_goals || [],
    };
  }

  async saveProfile(userId: number, profile: UserProfile, quizVersion = 'v1'): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO user_profiles
         (user_id, skin_type_detailed, skin_concerns, allergy_ingredient_ids,
          pregnancy_status, age_group, climate_preference, budget_tier,
          ethical_preferences, routine_complexity, hair_type, supplement_goals,
          last_quiz_at, quiz_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, NOW(), $13)
       ON CONFLICT (user_id) DO UPDATE SET
         skin_type_detailed = EXCLUDED.skin_type_detailed,
         skin_concerns = EXCLUDED.skin_concerns,
         allergy_ingredient_ids = EXCLUDED.allergy_ingredient_ids,
         pregnancy_status = EXCLUDED.pregnancy_status,
         age_group = EXCLUDED.age_group,
         climate_preference = EXCLUDED.climate_preference,
         budget_tier = EXCLUDED.budget_tier,
         ethical_preferences = EXCLUDED.ethical_preferences,
         routine_complexity = EXCLUDED.routine_complexity,
         hair_type = EXCLUDED.hair_type,
         supplement_goals = EXCLUDED.supplement_goals,
         last_quiz_at = NOW(),
         quiz_version = EXCLUDED.quiz_version,
         updated_at = NOW()`,
      [
        userId,
        profile.skin_type_detailed,
        profile.skin_concerns,
        profile.allergy_ingredient_ids,
        profile.pregnancy_status,
        profile.age_group,
        profile.climate_preference,
        profile.budget_tier,
        JSON.stringify(profile.ethical_preferences),
        profile.routine_complexity,
        profile.hair_type,
        profile.supplement_goals,
        quizVersion,
      ],
    );
  }

  async saveSession(
    userId: number | null,
    anonymousKey: string | null,
    answers: QuizAnswers,
    profile: UserProfile,
    quizVersion = 'v1',
  ): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO quiz_sessions (user_id, anonymous_key, quiz_version, raw_answers, profile_snapshot)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)`,
      [userId, anonymousKey, quizVersion, JSON.stringify(answers), JSON.stringify(profile)],
    );
  }

  async getProfile(userId: number): Promise<any> {
    const rows = await this.dataSource.query(
      `SELECT * FROM user_profiles WHERE user_id = $1`,
      [userId],
    );
    return rows[0] || null;
  }
}
