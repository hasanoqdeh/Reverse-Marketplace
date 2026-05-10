import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MerchantDocument } from './merchant-document.entity';
import { User } from './user.entity';

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('merchant_profiles')
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

  @Column({ type: 'jsonb', nullable: true })
  coverageAreas: any;

  @Column({ type: 'jsonb', nullable: true })
  categories: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MerchantDocument, (document) => document.merchant)
  documents: MerchantDocument[];

  @ManyToOne(() => User, (user) => user.merchantProfile)
  user: User;
}
