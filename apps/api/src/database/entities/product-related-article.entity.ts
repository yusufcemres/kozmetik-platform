import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { ContentArticle } from './content-article.entity';

@Entity('product_related_articles')
export class ProductRelatedArticle {
  @PrimaryGeneratedColumn()
  product_related_article_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  article_id: number;

  @ManyToOne(() => ContentArticle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: ContentArticle;
}
