import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiKey } from './api-key.entity';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn()
  webhook_id: number;

  @Column()
  api_key_id: number;

  @ManyToOne(() => ApiKey)
  @JoinColumn({ name: 'api_key_id' })
  api_key: ApiKey;

  @Column({ length: 500 })
  url: string;

  @Column('simple-array')
  events: string[];

  @Column({ length: 64, nullable: true })
  secret_hash: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  failed_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_triggered_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
