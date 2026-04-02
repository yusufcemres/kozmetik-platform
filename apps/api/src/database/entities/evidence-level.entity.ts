import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('evidence_levels')
export class EvidenceLevel {
  @PrimaryGeneratedColumn()
  evidence_level_id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  level_key: string; // e.g. 'systematic_review', 'randomized_controlled'

  @Column({ type: 'varchar', length: 100 })
  level_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  rank_order: number; // 1 = en güçlü, 8 = en zayıf

  @Column({ type: 'varchar', length: 20, nullable: true })
  badge_color: string; // '#22c55e' for strong, etc.

  @Column({ type: 'varchar', length: 10, nullable: true })
  badge_emoji: string; // 🟢🟡🟠🔵

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
