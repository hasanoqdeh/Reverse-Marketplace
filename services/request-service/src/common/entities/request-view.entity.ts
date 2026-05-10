import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Request } from './request.entity';

@Entity('request_views')
@Index(['requestId'])
@Index(['merchantId'])
@Index(['viewedAt'])
export class RequestView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestId: string;

  @Column({ nullable: true })
  merchantId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  viewedAt: Date;

  // Relations
  @ManyToOne(() => Request, (request) => request.views)
  request: Request;
}
