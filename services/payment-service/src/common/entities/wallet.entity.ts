import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { WalletTransaction } from './wallet-transaction.entity';

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

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

@Entity('wallets')
@Index(['user_id'])
@Index(['status'])
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2, 
    default: 0.00 
  })
  balance: number;

  @Column({ 
    type: 'varchar', 
    length: 3, 
    default: 'SAR' 
  })
  currency: string;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.ACTIVE,
  })
  status: WalletStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0.00 })
  frozen_balance: number;

  @Column({ type: 'timestamp', nullable: true })
  last_transaction_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => WalletTransaction, transaction => transaction.wallet)
  transactions: WalletTransaction[];
}
