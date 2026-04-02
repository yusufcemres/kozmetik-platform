import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContentArticle } from './content-article.entity';

@Entity('sponsorship_disclosures')
export class SponsorshipDisclosure {
  @PrimaryGeneratedColumn()
  disclosure_id: number;

  @Column({ type: 'int' })
  article_id: number;

  @ManyToOne(() => ContentArticle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: ContentArticle;

  @Column({ type: 'varchar', length: 200 })
  sponsor_name: string;

  @Column({ type: 'varchar', length: 20 })
  disclosure_level: string; // prominent, standard, minimal

  @Column({ type: 'text', nullable: true })
  disclosure_text: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
