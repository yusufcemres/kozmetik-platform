import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IngredientAlias } from './ingredient-alias.entity';
import { IngredientEvidenceLink } from './ingredient-evidence-link.entity';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn()
  ingredient_id: number;

  @Column({ type: 'varchar', length: 20, default: 'cosmetic' })
  domain_type: string;

  @Column({ type: 'varchar', length: 250 })
  inci_name: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  common_name: string;

  @Column({ type: 'varchar', length: 250, unique: true })
  ingredient_slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ingredient_group: string; // e.g. 'humectant', 'emollient', 'active'

  @Column({ type: 'varchar', length: 50, nullable: true })
  origin_type: string; // synthetic, natural, semi_synthetic, biotechnology

  @Column({ type: 'text', nullable: true })
  function_summary: string;

  @Column({ type: 'text', nullable: true })
  detailed_description: string;

  @Column({ type: 'text', nullable: true })
  sensitivity_note: string;

  @Column({ type: 'boolean', default: false })
  allergen_flag: boolean;

  @Column({ type: 'boolean', default: false })
  fragrance_flag: boolean;

  @Column({ type: 'boolean', default: false })
  preservative_flag: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  evidence_level: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  safety_class: string; // 'harmful' | 'questionable' | 'neutral' | 'beneficial'

  @Column({ type: 'text', nullable: true })
  safety_note: string;

  @Column({ type: 'jsonb', nullable: true })
  food_sources: {
    food_name: string;
    amount_per_100g: number;
    unit: string;
    bioavailability?: string;
    note?: string;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  daily_recommended_value: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  daily_recommended_unit: string; // 'mg', 'mcg', 'IU'

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'smallint', nullable: true })
  bioavailability_score: number | null;

  @Column({ type: 'int', nullable: true })
  parent_ingredient_id: number | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  form_type: string | null;

  @Column({ type: 'smallint', nullable: true })
  absorption_rate: number | null;

  // ── Kanıt katmanı (Migration 019) ─────────────────────────────

  @Column({ type: 'varchar', length: 1, nullable: true })
  evidence_grade: string | null; // A|B|C|D|E

  @Column({ type: 'jsonb', nullable: true })
  evidence_citations: {
    source: string;
    url?: string;
    pmid?: string;
    doi?: string;
    title?: string;
    year?: number;
    accessed?: string;
    opinion_ref?: string;
  }[] | null;

  // ── Takviye dozaj kanıtı ──────────────────────────────────────

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  effective_dose_min: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  effective_dose_max: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  effective_dose_unit: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ul_dose: number | null;

  // ── Kozmetik konsantrasyon kanıtı ─────────────────────────────

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  efficacy_conc_min: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  efficacy_conc_max: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  eu_annex_iii_limit: number | null;

  // ── Regülasyon durumu (kozmetik) ──────────────────────────────

  @Column({ type: 'varchar', length: 30, nullable: true })
  cir_status: string | null; // safe | safe_as_used | insufficient_data | unsafe

  @Column({ type: 'varchar', length: 50, nullable: true })
  sccs_opinion_ref: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cmr_class: string | null; // 1A | 1B | 2

  @Column({ type: 'varchar', length: 5, nullable: true })
  iarc_group: string | null; // 1 | 2A | 2B | 3 | 4

  @Column({ type: 'boolean', default: false })
  endocrine_flag: boolean;

  @Column({ type: 'boolean', default: false })
  eu_banned: boolean;

  @Column({ type: 'boolean', default: false })
  eu_restricted: boolean;

  @OneToMany(() => IngredientAlias, (alias) => alias.ingredient)
  aliases: IngredientAlias[];

  @OneToMany(() => IngredientEvidenceLink, (link) => link.ingredient)
  evidence_links: IngredientEvidenceLink[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
