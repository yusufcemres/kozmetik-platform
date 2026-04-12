import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('user_favorites')
@Unique('uq_user_product', ['user_id', 'product_id'])
export class UserFavorite {
  @PrimaryGeneratedColumn()
  favorite_id: number;

  @Index()
  @Column({ type: 'int' })
  user_id: number;

  @Index()
  @Column({ type: 'int' })
  product_id: number;

  @CreateDateColumn()
  created_at: Date;
}
