import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notification_preferences')
@Index(['userId'])
export class NotificationPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ default: true })
  pushEnabled: boolean;

  @Column({ default: true })
  smsEnabled: boolean;

  @Column({ default: false })
  marketingEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.notificationPreferences, { onDelete: 'CASCADE' })
  user: User;
}
