import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Request } from './request.entity';

@Entity('request_images')
@Index(['requestId'])
@Index(['sortOrder'])
export class RequestImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestId: string;

  @Column()
  imageUrl: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  originalFileName: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  mimeType: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Request, (request) => request.images, { onDelete: 'CASCADE' })
  request: Request;
}
