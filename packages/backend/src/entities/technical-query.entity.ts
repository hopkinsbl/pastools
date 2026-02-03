import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';

export enum TQPriority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum TQStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'UnderReview',
  ANSWERED = 'Answered',
  APPROVED = 'Approved',
  CLOSED = 'Closed',
}

@Entity('technical_queries')
@Index(['projectId', 'status'])
@Index(['projectId', 'assignedTo'])
export class TechnicalQuery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({
    type: 'enum',
    enum: TQPriority,
  })
  priority: TQPriority;

  @Column({
    type: 'enum',
    enum: TQStatus,
    default: TQStatus.DRAFT,
  })
  status: TQStatus;

  @Column({ type: 'jsonb', nullable: true })
  impactFlags: {
    designChange?: boolean;
    scheduleImpact?: boolean;
    costImpact?: boolean;
    safetyImpact?: boolean;
  };

  @Column({ type: 'text', nullable: true })
  answer: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @Column()
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignedToUser: User;

  @Column({ nullable: true })
  assignedTo: string;
}
