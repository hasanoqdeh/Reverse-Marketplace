import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { MerchantProfile } from './merchant-profile.entity';
import { NotificationPreferences } from './notification-preferences.entity';

export enum UserRole {
  BUYER = 'BUYER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
}

@Entity('users')
@Index(['phoneNumber'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BUYER,
  })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: 'float', default: 0.0 })
  trustScore: number;

  @Column({ nullable: true })
  avatarUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToOne(() => MerchantProfile, (merchantProfile) => merchantProfile.user)
  merchantProfile?: MerchantProfile;

  @OneToOne(() => NotificationPreferences, (preferences) => preferences.user)
  notificationPreferences: NotificationPreferences;
}
