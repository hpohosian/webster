import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ApiHideProperty } from '@nestjs/swagger';
import { FileEntity } from '../../files/entities/file.entity';
import { ProjectVersion } from './project-version.entity';

@Entity()
export class Project {
  @ApiProperty({
    example: 'c1a9f8c2-1234-4d56-9abc-123456789abc',
    description: 'Unique project identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'My first project',
    description: 'Project title',
  })
  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ['photo', 'logo'],
    default: 'photo',
  })
  type: 'photo' | 'logo';

  @ApiProperty({
    description: 'Project data (canvas + objects)',
  })
  @Column({ type: 'jsonb' })
  projectData: Record<string, any>;

  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.projects, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ApiProperty({
    description: 'Account creation timestamp',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => FileEntity, (file) => file.project)
  files: FileEntity[];

  @ManyToOne(() => FileEntity, { nullable: true })
  @JoinColumn()
  coverImage: FileEntity;

  @OneToMany(() => ProjectVersion, (version) => version.project)
  versions: ProjectVersion[];

  @Column({ nullable: true })
  currentVersionId: string;

  @Column({ type: "text", nullable: true })
  thumbnail: string;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ default: false })
  isDefaultTemplate: boolean;
}
