import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('scoring_configs')
export class ScoringConfig {
  @PrimaryGeneratedColumn()
  config_id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  config_key: string; // e.g. 'rank_weight_compatibility', 'base_order_top5'

  @Column({ type: 'decimal', precision: 5, scale: 3 })
  config_value: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, default: 'scoring' })
  config_group: string; // scoring, search, personal

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
