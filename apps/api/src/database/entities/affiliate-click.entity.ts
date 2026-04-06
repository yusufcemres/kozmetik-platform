import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AffiliateLink } from './affiliate-link.entity';

@Entity('affiliate_clicks')
export class AffiliateClick {
  @PrimaryGeneratedColumn()
  click_id: number;

  @Column({ type: 'int' })
  affiliate_link_id: number;

  @ManyToOne(() => AffiliateLink, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_link_id' })
  affiliate_link: AffiliateLink;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source_page: string; // product_detail, search, recommendation, skin_analysis

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip_hash: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn()
  clicked_at: Date;
}
