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

export enum TagType {
  AI = 'AI',
  AO = 'AO',
  DI = 'DI',
  DO = 'DO',
  PID = 'PID',
  VALVE = 'Valve',
  DRIVE = 'Drive',
  TOTALISER = 'Totaliser',
  CALC = 'Calc',
}

@Entity('tags')
@Index(['projectId', 'name'])
@Index(['projectId', 'type'])
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @Column({
    type: 'enum',
    enum: TagType,
  })
  type: TagType;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  engineeringUnits: string;

  @Column({ type: 'float', nullable: true })
  scaleLow: number;

  @Column({ type: 'float', nullable: true })
  scaleHigh: number;

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
