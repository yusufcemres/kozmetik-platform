import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Brand } from './brand.entity';

@Entity('brand_certificates')
export class BrandCertificate {
  @PrimaryGeneratedColumn()
  certificate_id: number;

  @Column({ type: 'int' })
  brand_id: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ type: 'varchar', length: 100 })
  certificate_type: string; // gmp | iso_22716 | dermatologist_test | vegan | cruelty_free | clinical_study | stability_test | other

  @Column({ type: 'varchar', length: 200 })
  certificate_name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  file_url: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  issuing_body: string;

  @Column({ type: 'date', nullable: true })
  issued_at: Date;

  @Column({ type: 'date', nullable: true })
  expires_at: Date;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  verification_status: string; // pending | verified | rejected

  @Column({ type: 'int', nullable: true })
  verified_by: number;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
