import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  CreateDateColumn,
} from 'typeorm';

@Entity('layers')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class BaseLayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column()
  name: string;

  @Column({ default: true })
  visible: boolean;

  @Column({ default: false })
  locked: boolean;

  @Column({ default: 100 })
  opacity: number;

  @Column({ default: 'normal' })
  blendMode: string;

  @Column({ default: 0 })
  position: number;

  @Column({ default: 0 })
  x: number;

  @Column({ default: 0 })
  y: number;

  @CreateDateColumn()
  createdAt: Date;
}
