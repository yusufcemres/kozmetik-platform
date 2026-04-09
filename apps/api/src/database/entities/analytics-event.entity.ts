import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('analytics_events')
@Index(['event_type', 'created_at'])
@Index(['product_id', 'created_at'])
@Index(['created_at'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn()
  event_id: number;

  @Column({ type: 'varchar', length: 36 })
  visitor_id: string;

  @Column({ type: 'varchar', length: 12, nullable: true })
  session_id: string;

  @Column({ type: 'varchar', length: 40 })
  event_type: string;

  @Column({ type: 'int', nullable: true })
  product_id: number;

  @Column({ type: 'int', nullable: true })
  brand_id: number;

  @Column({ type: 'varchar', length: 300, nullable: true })
  page_path: string;

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>;

  @Column({ type: 'varchar', length: 10, nullable: true })
  device_type: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  ip_hash: string;

  @CreateDateColumn()
  created_at: Date;
}
