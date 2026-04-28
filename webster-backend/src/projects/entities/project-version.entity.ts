import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { Project } from './project.entity';

@Entity()
export class ProjectVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, (project) => project.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Index()
  @Column()
  projectId: string;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column()
  versionNumber: number;

  @Column({ default: false })
  isAutoSave: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
