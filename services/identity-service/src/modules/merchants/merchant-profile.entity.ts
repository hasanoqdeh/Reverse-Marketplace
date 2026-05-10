import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MerchantDocument } from '../../common/entities/merchant-document.entity';

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
}
