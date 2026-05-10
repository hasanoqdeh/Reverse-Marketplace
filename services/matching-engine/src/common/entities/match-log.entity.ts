import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('match_logs')
@Index(['requestId'])
@Index(['createdAt'])
@Index(['latencyMs'])
export class MatchLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestId: string;

  @Column({ type: 'jsonb' })
  matchedMerchants: Array<{
    merchantId: string;
    score: number;
    distance?: number;
    trustScore: number;
  }>;

  @Column({ type: 'integer' })
  latencyMs: number;

  @Column({ type: 'integer' })
  totalCandidates: number;

  @Column({ type: 'integer' })
  eligibleCandidates: number;

  @Column({ type: 'jsonb', nullable: true })
  filters: {
    categoryId: string;
    location?: {
      latitude: number;
      longitude: number;
      radiusKm: number;
    };
    minTrustScore: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  rejectionReasons: Array<{
    reason: string;
    count: number;
  }>;

  @CreateDateColumn()
  createdAt: Date;
}
