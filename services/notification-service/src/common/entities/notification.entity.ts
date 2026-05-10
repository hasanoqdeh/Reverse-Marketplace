import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotificationToken } from './notification-token.entity';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
  RETRYING = 'RETRYING',
}

export enum NotificationType {
  MATCH_FOUND = 'MATCH_FOUND',
  BID_SUBMITTED = 'BID_SUBMITTED',
  BID_ACCEPTED = 'BID_ACCEPTED',
  BID_REJECTED = 'BID_REJECTED',
  BID_EXPIRED = 'BID_EXPIRED',
  REQUEST_COMPLETED = 'REQUEST_COMPLETED',
  REQUEST_CANCELLED = 'REQUEST_CANCELLED',
  USER_BANNED = 'USER_BANNED',
  SYSTEM = 'SYSTEM',
}

export enum DeliveryChannel {
  SOCKET = 'SOCKET',
  FCM = 'FCM',
  APNS = 'APNS',
}

export enum DeliveryLogStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

@Entity('notifications')
@Index(['user_id'])
@Index(['delivery_status'])
@Index(['is_read'])
@Index(['created_at'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  delivery_status: DeliveryStatus;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
