import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Entity('ingredient_evidence_links')
export class IngredientEvidenceLink {
  @PrimaryGeneratedColumn()
  link_id: number;

  @Column({ type: 'int' })
  ingredient_id: number;

  @ManyToOne(() => Ingredient, (ing) => ing.evidence_links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ type: 'varchar', length: 500 })
  source_url: string; // PubMed, dergi linki

  @Column({ type: 'varchar', length: 250 })
  source_title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source_type: string; // 'pubmed', 'journal', 'book', 'fda', 'eu_regulation'

  @Column({ type: 'int', nullable: true })
  publication_year: number;

  @Column({ type: 'text', nullable: true })
  summary_note: string;

  @CreateDateColumn()
  created_at: Date;
}
