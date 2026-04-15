import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ApiHideProperty } from '@nestjs/swagger';

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
}
