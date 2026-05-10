import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { MerchantDocument } from './merchant-document.entity';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('merchant_profiles')
@Index(['userId'])
export class MerchantProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  commercialRegistration: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ type: 'json', nullable: true })
  coverageAreas: any;

  @Column({ type: 'json', nullable: true })
  categories: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.merchantProfile, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => MerchantDocument, (document) => document.merchant)
  documents: MerchantDocument[];
}
