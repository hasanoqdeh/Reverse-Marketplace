import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Subscription } from './subscription.entity';

export enum PlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Entity('subscription_plans')
@Index(['type'])
@Index(['status'])
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'enum',
    enum: PlanType,
    unique: true,
  })
  type: PlanType;

  @Column({ 
    type: 'varchar', 
    length: 100 
  })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2,
    default: 0.00 
  })
  price: number;

  @Column({ 
    type: 'varchar', 
    length: 3, 
    default: 'SAR' 
  })
  currency: string;

  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  billing_cycle: BillingCycle;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  limits: Record<string, any>;

  @Column({ type: 'integer', default: 30 })
  trial_days: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0.00 })
  setup_fee: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Subscription, subscription => subscription.plan)
  subscriptions: Subscription[];
}
