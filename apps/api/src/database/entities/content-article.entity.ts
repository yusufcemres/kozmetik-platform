import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('content_articles')
export class ContentArticle {
  @PrimaryGeneratedColumn()
  article_id: number;

  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 50 })
  content_type: string; // guide, ingredient_explainer, need_guide, label_reading, comparison, news

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  body_markdown: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string; // draft, in_review, published, archived

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
