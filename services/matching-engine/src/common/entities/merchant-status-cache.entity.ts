import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('merchant_status_cache')
@Index(['merchantId'], { unique: true })
@Index(['isOnline'])
@Index(['isVerified'])
@Index(['isBanned'])
export class MerchantStatusCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  merchantId: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: 'float', default: 0.0 })
  trustScore: number;

  @Column({ nullable: true })
  lastSeen: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
