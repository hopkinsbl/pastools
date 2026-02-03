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

export enum PunchlistCategory {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum PunchlistPriority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum PunchlistStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress',
  PENDING_VERIFICATION = 'PendingVerification',
  CLOSED = 'Closed',
}

@Entity('punchlist_items')
@Index(['projectId', 'status'])
@Index(['projectId', 'category'])
@Index(['projectId', 'assignedTo'])
export class PunchlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: PunchlistCategory,
  })
  category: PunchlistCategory;

  @Column({
    type: 'enum',
    enum: PunchlistPriority,
  })
  priority: PunchlistPriority;

  @Column({
    type: 'enum',
    enum: PunchlistStatus,
    default: PunchlistStatus.OPEN,
  })
  status: PunchlistStatus;

  @Column({ type: 'text', nullable: true })
  closureCriteria: string;

  @Column({ default: false })
  evidenceRequired: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignedToUser: User;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @Column()
  createdBy: string;
}
