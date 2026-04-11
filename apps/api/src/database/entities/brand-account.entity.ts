import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Brand } from './brand.entity';

@Entity('brand_accounts')
export class BrandAccount {
  @PrimaryGeneratedColumn()
  account_id: number;

  @Column({ type: 'int', unique: true })
  brand_id: number;

  @OneToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ type: 'varchar', length: 200, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 250 })
  password_hash: string;

  @Column({ type: 'varchar', length: 150 })
  representative_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  representative_title: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string;

  // Verification
  @Column({ type: 'varchar', length: 30, default: 'pending' })
  verification_status: string; // pending | email_verified | domain_verified | manually_verified | rejected

  @Column({ type: 'varchar', length: 50, nullable: true })
  verification_method: string;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @Column({ type: 'int', nullable: true })
  verified_by: number;

  // Plan
  @Column({ type: 'varchar', length: 20, default: 'starter' })
  plan: string; // starter | professional | enterprise

  @Column({ type: 'varchar', length: 10, default: 'monthly' })
  billing_cycle: string; // monthly | yearly

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @Column({ type: 'int', default: 0 })
  login_count: number;

  @Column({ type: 'timestamp', nullable: true })
  trial_ends_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
