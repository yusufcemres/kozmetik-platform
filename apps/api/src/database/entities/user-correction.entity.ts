import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_corrections')
export class UserCorrection {
  @PrimaryGeneratedColumn()
  correction_id: number;

  @Column({ type: 'varchar', length: 100 })
  entity_type: string; // 'product', 'ingredient'

  @Column({ type: 'int' })
  entity_id: number;

  @Column({ type: 'text' })
  correction_text: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  reporter_email: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending, accepted, rejected

  @Column({ type: 'text', nullable: true })
  admin_note: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
