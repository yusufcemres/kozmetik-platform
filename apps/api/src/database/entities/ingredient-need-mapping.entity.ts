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
import { Need } from './need.entity';

@Entity('ingredient_need_mappings')
export class IngredientNeedMapping {
  @PrimaryGeneratedColumn()
  ingredient_need_mapping_id: number;

  @Column({ type: 'int' })
  ingredient_id: number;

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ type: 'int' })
  need_id: number;

  @ManyToOne(() => Need, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'need_id' })
  need: Need;

  @Column({ type: 'int' })
  relevance_score: number; // 0-100

  @Column({ type: 'varchar', length: 50 })
  effect_type: string; // direct_support, indirect_support, complementary, caution_related

  @Column({ type: 'varchar', length: 50, nullable: true })
  evidence_level: string;

  @Column({ type: 'text', nullable: true })
  usage_context_note: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
