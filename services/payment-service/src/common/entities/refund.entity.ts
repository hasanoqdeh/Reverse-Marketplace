import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WalletTransaction } from './wallet-transaction.entity';
import { PaymentIntent } from './payment-intent.entity';

export enum RefundStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum RefundReason {
  DUPLICATE = 'DUPLICATE',
  FRAUDULENT = 'FRAUDULENT',
  REQUESTED_BY_CUSTOMER = 'REQUESTED_BY_CUSTOMER',
  SERVICE_NOT_PROVIDED = 'SERVICE_NOT_PROVIDED',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  OTHER = 'OTHER',
}

@Entity('refunds')
@Index(['transaction_id'])
@Index(['payment_intent_id'])
@Index(['status'])
@Index(['created_at'])
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  transaction_id: string;

  @Column({ type: 'uuid' })
  payment_intent_id: string;

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
    enum: RefundReason,
  })
  reason: RefundReason;

  @Column({ type: 'text', nullable: true })
  reason_description: string;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column({ type: 'text', nullable: true })
  external_reference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gateway: string;

  @Column({ type: 'jsonb', nullable: true })
  gateway_response: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @Column({ type: 'uuid', nullable: true })
  refund_transaction_id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => WalletTransaction, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: WalletTransaction;

  @ManyToOne(() => PaymentIntent, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payment_intent_id' })
  payment_intent: PaymentIntent;
}
