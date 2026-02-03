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

@Entity('links')
@Index(['sourceEntityType', 'sourceEntityId'])
@Index(['targetEntityType', 'targetEntityId'])
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sourceEntityType: string;

  @Column('uuid')
  sourceEntityId: string;

  @Column()
  targetEntityType: string;

  @Column('uuid')
  targetEntityId: string;

  @Column({ nullable: true })
  linkType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @Column()
  createdBy: string;
}
