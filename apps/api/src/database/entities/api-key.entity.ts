import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn()
  api_key_id: number;

  @Column({ length: 100 })
  company_name: string;

  @Column({ length: 255 })
  contact_email: string;

  @Column({ length: 64, unique: true })
  key_hash: string;

  @Column({ length: 12, unique: true })
  key_prefix: string;

  @Column('simple-array', { nullable: true })
  allowed_endpoints: string[];

  @Column({ type: 'int', default: 1000 })
  rate_limit_per_hour: number;

  @Column({ type: 'int', default: 10000 })
  rate_limit_per_day: number;

  @Column({ type: 'bigint', default: 0 })
  total_requests: number;

  @Column({ type: 'timestamp', nullable: true })
  last_request_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
