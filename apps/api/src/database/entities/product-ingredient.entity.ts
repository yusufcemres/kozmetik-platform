import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Ingredient } from './ingredient.entity';

@Entity('product_ingredients')
export class ProductIngredient {
  @PrimaryGeneratedColumn()
  product_ingredient_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, (p) => p.ingredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', nullable: true })
  ingredient_id: number;

  @ManyToOne(() => Ingredient, { nullable: true })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ type: 'varchar', length: 250 })
  ingredient_display_name: string;

  @Column({ type: 'int' })
  inci_order_rank: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  listed_as_raw: string;

  @Column({ type: 'varchar', length: 20, default: 'unknown' })
  concentration_band: string; // high, medium, low, trace, unknown

  @Column({ type: 'boolean', default: false })
  is_below_one_percent_estimate: boolean;

  @Column({ type: 'boolean', default: false })
  is_highlighted_in_claims: boolean;

  @Column({ type: 'varchar', length: 20, default: 'auto' })
  match_status: string; // auto, suggestion, manual, unmatched

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  match_confidence: number;

  // ── Konsantrasyon (Migration 020) ───────────────────────────────

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  concentration_percent: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  concentration_source: string | null; // manufacturer | estimated | unknown

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
