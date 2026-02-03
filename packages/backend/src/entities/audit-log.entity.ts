import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum AuditOperation {
  CREATE = 'Create',
  UPDATE = 'Update',
  DELETE = 'Delete',
  LINK = 'Link',
  UNLINK = 'Unlink',
  MERGE = 'Merge',
}

@Entity('audit_logs')
@Index(['userId'])
@Index(['entityType', 'entityId'])
@Index(['timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: AuditOperation,
  })
  operation: AuditOperation;

  @Column()
  entityType: string;

  @Column('uuid')
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
}
