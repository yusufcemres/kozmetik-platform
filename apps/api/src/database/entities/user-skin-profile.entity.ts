import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_skin_profiles')
export class UserSkinProfile {
  @PrimaryGeneratedColumn()
  profile_id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  anonymous_id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  skin_type: string; // oily, dry, combination, normal, sensitive

  @Column({ type: 'jsonb', default: '[]' })
  concerns: number[]; // need_id array

  @Column({ type: 'jsonb', default: '{}' })
  sensitivities: {
    fragrance: boolean;
    alcohol: boolean;
    paraben: boolean;
    essential_oils: boolean;
  };

  @Column({ type: 'varchar', length: 10, nullable: true })
  age_range: string; // '18-24', '25-34', '35-44', '45+'

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
