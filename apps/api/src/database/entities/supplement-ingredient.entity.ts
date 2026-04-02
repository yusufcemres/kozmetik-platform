import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Ingredient } from './ingredient.entity';

@Entity('supplement_ingredients')
export class SupplementIngredient {
  @PrimaryGeneratedColumn()
  supplement_ingredient_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  ingredient_id: number;

  @ManyToOne(() => Ingredient)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  amount_per_serving: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string; // mg, mcg, g, IU, ml, CFU

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  daily_value_percentage: number; // e.g. 100.0 = %100 RDA

  @Column({ type: 'boolean', default: false })
  is_proprietary_blend: boolean; // özel karışım — miktar belirsiz

  @Column({ type: 'int', default: 0 })
  sort_order: number; // Nutrition facts sırası

  @CreateDateColumn()
  created_at: Date;
}
