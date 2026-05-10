import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Request } from './request.entity';
import { RequestStatus } from '../enums/request-status.enum';

@Entity('request_status_history')
@Index(['requestId'])
@Index(['changedAt'])
export class RequestStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestId: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
  })
  oldStatus: RequestStatus;

  @Column({
    type: 'enum',
    enum: RequestStatus,
  })
  newStatus: RequestStatus;

  @Column()
  changedBy: string;

  @Column({ nullable: true })
  changeReason: string;

  @CreateDateColumn()
  changedAt: Date;

  // Relations
  @ManyToOne(() => Request, (request) => request.statusHistory, { onDelete: 'CASCADE' })
  request: Request;
}
