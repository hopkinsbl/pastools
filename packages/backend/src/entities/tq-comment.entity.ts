import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TechnicalQuery } from './technical-query.entity';
import { User } from './user.entity';

@Entity('tq_comments')
export class TQComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TechnicalQuery)
  @JoinColumn({ name: 'tqId' })
  technicalQuery: TechnicalQuery;

  @Column()
  tqId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
