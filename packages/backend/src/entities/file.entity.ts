import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  contentType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column()
  storageKey: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  uploadedByUser: User;

  @Column()
  uploadedBy: string;
}
