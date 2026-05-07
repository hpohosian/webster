import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class Layer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column()
  projectId: string;

  @ManyToOne(() => Project, (project) => project.layers, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "projectId" })
  project: Project;

  @Column()
  name: string;

  @Column({
    type: "varchar",
    default: "image",
  })
  type: "image" | "text" | "shape";

  @Column({ default: true })
  visible: boolean;

  @Column({ default: false })
  locked: boolean;

  @Column({ default: 100 })
  opacity: number;

  @Column({ default: "normal" })
  blendMode: string;

  @Column({ default: 0 })
  position: number;

  @CreateDateColumn()
  createdAt: Date;
}
