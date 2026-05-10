import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('conversations')
@Index(['buyer_id'])
@Index(['merchant_id'])
@Index(['status'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  request_id: string;

  @Column({ type: 'uuid' })
  buyer_id: string;

  @Column({ type: 'uuid' })
  merchant_id: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'ARCHIVED', 'BLOCKED', 'CLOSED'],
    default: 'ACTIVE',
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
