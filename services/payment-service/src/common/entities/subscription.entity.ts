import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

@Entity('subscriptions')
@Index(['user_id'])
@Index(['plan_id'])
@Index(['status'])
@Index(['expires_at'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  plan_id: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  status: SubscriptionStatus;

  @Column({ type: 'timestamp' })
  started_at: Date;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  trial_ends_at: Date;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2,
    nullable: true 
  })
  amount_paid: number;

  @Column({ 
    type: 'varchar', 
    length: 3, 
    default: 'SAR' 
  })
  currency: string;

  @Column({ type: 'uuid', nullable: true })
  payment_intent_id: string;

  @Column({ type: 'boolean', default: false })
  auto_renew: boolean;

  @Column({ type: 'timestamp', nullable: true })
  next_billing_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  usage_stats: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => SubscriptionPlan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;
}
