import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { MerchantProfile } from './merchant-profile.entity';

export enum DocumentType {
  COMMERCIAL_REGISTRATION = 'COMMERCIAL_REGISTRATION',
  IDENTITY_DOCUMENT = 'IDENTITY_DOCUMENT',
  TAX_CERTIFICATE = 'TAX_CERTIFICATE',
  TRADE_LICENSE = 'TRADE_LICENSE',
}

@Entity('merchant_documents')
@Index(['merchantId'])
export class MerchantDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column()
  documentUrl: string;

  @CreateDateColumn()
  uploadedAt: Date;

  // Relations
  @ManyToOne(() => MerchantProfile, (merchant) => merchant.documents, { onDelete: 'CASCADE' })
  merchant: MerchantProfile;
}
