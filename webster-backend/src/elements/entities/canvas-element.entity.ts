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
import { Project } from '../../projects/entities/project.entity';

@Entity('canvas_elements')
export class CanvasElement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  type: 'image' | 'text' | 'shape';

  @Column('float')
  x: number;

  @Column('float')
  y: number;

  @Column('float', { nullable: true })
  width: number;

  @Column('float', { nullable: true })
  height: number;

  @Column('float', { default: 0 })
  rotation: number;

  @Column('float', { default: 1 })
  scale: number;

  @Column({ default: 0 })
  zIndex: number;

  @Column({ nullable: true })
  parentId: string;

  // текст, стили, src и т.д.
  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
