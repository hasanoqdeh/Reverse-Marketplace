import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('socket_sessions')
@Index(['user_id'])
@Index(['socket_id'])
@Index(['last_seen_at'])
export class SocketSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  socket_id: string;

  @Column({ type: 'timestamp' })
  connected_at: Date;

  @Column({ type: 'timestamp' })
  last_seen_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
