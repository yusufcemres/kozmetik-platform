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

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => IngredientAlias, (alias) => alias.ingredient)
  aliases: IngredientAlias[];

  @OneToMany(() => IngredientEvidenceLink, (link) => link.ingredient)
  evidence_links: IngredientEvidenceLink[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
