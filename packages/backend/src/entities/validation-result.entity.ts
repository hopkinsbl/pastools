import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

export enum ValidationSeverity {
  ERROR = 'Error',
  WARNING = 'Warning',
  INFO = 'Info',
}

@Entity('validation_results')
export class ValidationResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @Column()
  entityType: string;

  @Column('uuid')
  entityId: string;

  @Column()
  ruleName: string;

  @Column({
    type: 'enum',
    enum: ValidationSeverity,
  })
  severity: ValidationSeverity;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  acknowledged: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
