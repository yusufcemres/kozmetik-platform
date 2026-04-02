import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Need } from './need.entity';
import { ContentArticle } from './content-article.entity';

@Entity('need_related_articles')
export class NeedRelatedArticle {
  @PrimaryGeneratedColumn()
  need_related_article_id: number;

  @Column({ type: 'int' })
  need_id: number;

  @ManyToOne(() => Need, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'need_id' })
  need: Need;

  @Column({ type: 'int' })
  article_id: number;

  @ManyToOne(() => ContentArticle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: ContentArticle;
}
