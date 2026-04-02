import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { ContentArticle } from './content-article.entity';

@Entity('ingredient_related_articles')
export class IngredientRelatedArticle {
  @PrimaryGeneratedColumn()
  ingredient_related_article_id: number;

  @Column({ type: 'int' })
  ingredient_id: number;

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ type: 'int' })
  article_id: number;

  @ManyToOne(() => ContentArticle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: ContentArticle;
}
