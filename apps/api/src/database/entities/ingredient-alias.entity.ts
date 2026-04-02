import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Entity('ingredient_aliases')
export class IngredientAlias {
  @PrimaryGeneratedColumn()
  alias_id: number;

  @Column({ type: 'int' })
  ingredient_id: number;

  @ManyToOne(() => Ingredient, (ing) => ing.aliases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Index() // GIN trigram index added in migration
  @Column({ type: 'varchar', length: 250 })
  alias_name: string;

  @Column({ type: 'varchar', length: 20, default: 'tr' })
  language: string;

  @Column({ type: 'varchar', length: 50, default: 'common' })
  alias_type: string; // 'common', 'trade', 'abbreviation', 'misspelling'

  @CreateDateColumn()
  created_at: Date;
}
