import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';

@Entity('merchant_interests')
@Index(['merchantId'])
@Index(['categoryId'])
@Index(['merchantId', 'categoryId'], { unique: true })
export class MerchantInterest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @Column()
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;
}
