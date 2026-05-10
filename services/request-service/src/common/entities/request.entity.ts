import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  Index,
} from 'typeorm';
import { RequestImage } from './request-image.entity';
import { RequestStatusHistory } from './request-status-history.entity';
import { RequestCategory } from './request-category.entity';
import { RequestView } from './request-view.entity';

export enum RequestStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  BLOCKED = 'BLOCKED',
}

@Entity('requests')
@Index(['buyerId'])
@Index(['categoryId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['publishedAt'])
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  buyerId: string;

  @Column()
  categoryId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  locationId: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.DRAFT,
  })
  status: RequestStatus;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => RequestImage, (image: RequestImage) => image.request, { cascade: true })
  images: RequestImage[];

  @OneToMany(() => RequestStatusHistory, (history: RequestStatusHistory) => history.request, { cascade: true })
  statusHistory: RequestStatusHistory[];

  @OneToMany(() => RequestView, (view: RequestView) => view.request)
  views: RequestView[];

  @ManyToOne(() => RequestCategory, (category: RequestCategory) => category.requests)
  category: RequestCategory;
}
