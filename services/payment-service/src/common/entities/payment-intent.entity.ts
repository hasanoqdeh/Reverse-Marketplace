import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentGateway {
  STRIPE = 'STRIPE',
  THAWANI = 'THAWANI',
}

export enum PaymentIntentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
}

export enum PaymentType {
  WALLET_DEPOSIT = 'WALLET_DEPOSIT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  BID_FEE = 'BID_FEE',
  INVOICE = 'INVOICE',
}

@Entity('payment_intents')
@Index(['user_id'])
@Index(['gateway'])
@Index(['status'])
@Index(['external_reference'])
@Index(['created_at'])
export class PaymentIntent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: PaymentGateway,
  })
  gateway: PaymentGateway;

  @Column({ 
    type: 'varchar', 
    length: 255,
    nullable: true 
  })
  external_reference: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  payment_type: PaymentType;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2 
  })
  amount: number;

  @Column({ 
    type: 'varchar', 
    length: 3, 
    default: 'SAR' 
  })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentIntentStatus,
    default: PaymentIntentStatus.PENDING,
  })
  status: PaymentIntentStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  gateway_response: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'uuid', nullable: true })
  related_wallet_transaction_id: string;

  @Column({ type: 'uuid', nullable: true })
  related_subscription_id: string;

  @Column({ type: 'uuid', nullable: true })
  related_invoice_id: string;

  @Column({ type: 'boolean', default: false })
  is_refundable: boolean;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2,
    default: 0.00 
  })
  refunded_amount: number;

  @CreateDateColumn()
  created_at: Date;
}
