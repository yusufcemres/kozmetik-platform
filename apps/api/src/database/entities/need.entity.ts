import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('needs')
export class Need {
  @PrimaryGeneratedColumn()
  need_id: number;

  @Column({ type: 'varchar', length: 20, default: 'cosmetic' })
  domain_type: string;

  @Column({ type: 'varchar', length: 150 })
  need_name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  need_slug: string;

  @Column({ type: 'varchar', length: 50, default: 'skin' })
  need_category: string; // 'skin' | 'body' | 'hair' | 'general_health'

  @Column({ type: 'varchar', length: 100, nullable: true })
  need_group: string; // e.g. 'skin_concern', 'skin_goal', 'sensitivity'

  @Column({ type: 'text', nullable: true })
  short_description: string;

  @Column({ type: 'text', nullable: true })
  detailed_description: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  user_friendly_label: string; // e.g. "Sivilce eğilimli ciltler için"

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
