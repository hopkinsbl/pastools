import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';

export enum ProjectRoleType {
  ADMIN = 'Admin',
  ENGINEER = 'Engineer',
  VIEWER = 'Viewer',
  APPROVER = 'Approver',
}

@Entity('project_roles')
export class ProjectRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ProjectRoleType,
  })
  role: ProjectRoleType;

  @CreateDateColumn()
  createdAt: Date;
}
