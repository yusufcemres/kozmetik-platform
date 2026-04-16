import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Entity('ingredient_interactions')
export class IngredientInteraction {
  @PrimaryGeneratedColumn()
  interaction_id: number;

  @Column({ type: 'int' })
  ingredient_a_id: number;

  @ManyToOne(() => Ingredient)
  @JoinColumn({ name: 'ingredient_a_id' })
  ingredient_a: Ingredient;

  @Column({ type: 'int' })
  ingredient_b_id: number;

  @ManyToOne(() => Ingredient)
  @JoinColumn({ name: 'ingredient_b_id' })
  ingredient_b: Ingredient;

  @Column({ type: 'varchar', length: 30 })
  severity: string; // none, mild, moderate, severe, contraindicated

  @Column({ type: 'varchar', length: 30, default: 'both' })
  domain_type: string; // cosmetic, supplement, both

  @Column({ type: 'varchar', length: 30, default: 'ingredient' })
  interaction_context: string; // ingredient, medication, food

  @Column({ type: 'text' })
  description: string; // "Retinol ve AHA birlikte kullanılmamalı"

  @Column({ type: 'text', nullable: true })
  recommendation: string; // "Farklı günlerde veya sabah/akşam ayrı kullanın"

  @Column({ type: 'varchar', length: 500, nullable: true })
  source_url: string; // Kaynak link (PubMed vb.)

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // ── Atıf alanları (Migration 019) ─────────────────────────────

  @Column({ type: 'varchar', length: 100, nullable: true })
  citation_source: string | null;

  @Column({ type: 'text', nullable: true })
  citation_url: string | null;

  @Column({ type: 'varchar', length: 1, nullable: true })
  evidence_level: string | null; // A|B|C|D

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
