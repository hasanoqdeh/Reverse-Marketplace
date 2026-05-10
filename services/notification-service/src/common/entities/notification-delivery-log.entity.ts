import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Notification, DeliveryChannel, DeliveryLogStatus } from './notification.entity';

@Entity('notification_delivery_logs')
@Index(['notification_id'])
@Index(['channel'])
@Index(['status'])
@Index(['delivered_at'])
export class NotificationDeliveryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  notification_id: string;

  @Column({
    type: 'enum',
    enum: DeliveryChannel,
  })
  channel: DeliveryChannel;

  @Column({
    type: 'enum',
    enum: DeliveryLogStatus,
    default: DeliveryLogStatus.PENDING,
  })
  status: DeliveryLogStatus;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Notification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;
}
