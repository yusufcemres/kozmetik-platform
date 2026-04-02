import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('approved_wordings')
export class ApprovedWording {
  @PrimaryGeneratedColumn()
  wording_id: number;

  @Column({ type: 'varchar', length: 50 })
  category: string; // 'benefit', 'caution', 'neutral'

  @Column({ type: 'text' })
  approved_text: string; // e.g. "destekleyebilir", "ilişkilendirilebilir"

  @Column({ type: 'text', nullable: true })
  forbidden_alternative: string; // e.g. "yok eder", "tedavi eder"

  @Column({ type: 'text', nullable: true })
  usage_note: string;

  @Column({ type: 'varchar', length: 20, default: 'tr' })
  language: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
