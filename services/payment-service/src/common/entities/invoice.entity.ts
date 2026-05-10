import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  BID_FEES = 'BID_FEES',
  DEPOSIT = 'DEPOSIT',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('invoices')
@Index(['user_id'])
@Index(['status'])
@Index(['type'])
@Index(['due_date'])
@Index(['created_at'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ 
    type: 'varchar', 
    length: 50 
  })
  invoice_number: string;

  @Column({
    type: 'enum',
    enum: InvoiceType,
  })
  type: InvoiceType;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2 
  })
  subtotal: number;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2,
    default: 0.00 
  })
  tax_amount: number;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2 
  })
  total_amount: number;

  @Column({ 
    type: 'varchar', 
    length: 3, 
    default: 'SAR' 
  })
  currency: string;

  @Column({ type: 'timestamp', nullable: true })
  issue_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    tax_rate?: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  billing_address: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  pdf_url: string;

  @Column({ type: 'uuid', nullable: true })
  payment_intent_id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
