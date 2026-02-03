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
import { Tag } from './tag.entity';
import { User } from './user.entity';

export enum AlarmPriority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

@Entity('alarms')
@Index(['projectId', 'tagId'])
@Index(['projectId', 'priority'])
export class Alarm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'tagId' })
  tag: Tag;

  @Column()
  tagId: string;

  @Column({
    type: 'enum',
    enum: AlarmPriority,
  })
  priority: AlarmPriority;

  @Column({ type: 'float', nullable: true })
  setpoint: number;

  @Column({ type: 'text', nullable: true })
  rationalization: string;

  @Column({ type: 'text', nullable: true })
  consequence: string;

  @Column({ type: 'text', nullable: true })
  operatorAction: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  importLineage: {
    sourceFile?: string;
    sheetName?: string;
    rowNumber?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @Column()
  createdBy: string;
}
