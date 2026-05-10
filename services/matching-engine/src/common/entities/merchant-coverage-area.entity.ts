import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';

@Entity('merchant_coverage_areas')
@Index(['merchantId'])
@Index(['locationId'])
@Index(['merchantId', 'locationId'], { unique: true })
export class MerchantCoverageArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @Column({ nullable: true })
  locationId: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'integer' })
  radiusKm: number;

  @CreateDateColumn()
  createdAt: Date;
}
