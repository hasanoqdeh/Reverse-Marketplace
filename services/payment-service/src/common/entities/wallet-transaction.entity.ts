import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BID_FEE = 'BID_FEE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  REFUND = 'REFUND',
  BONUS = 'BONUS',
  PAYOUT = 'PAYOUT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

@Entity('wallet_transactions')
@Index(['wallet_id'])
@Index(['type'])
@Index(['status'])
@Index(['reference_id', 'reference_type'])
@Index(['created_at'])
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  wallet_id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2 
  })
  amount: number;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2 
  })
  balance_before: number;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2 
  })
  balance_after: number;

  @Column({ 
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true 
  })
  reference_type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  related_transaction_id: string;

  @Column({ type: 'text', nullable: true })
  external_reference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gateway: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;
}
