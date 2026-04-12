import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../users/entities/user.entity';

@Entity('email_verifications')
export class EmailVerification {
  @ApiProperty({ example: 1, description: 'Unique identifier of the verification record' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '123456', description: '6-digit verification code sent to the user' })
  @Column()
  code: string;

  @ApiProperty({ description: 'Timestamp when the code was generated' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the code will expire' })
  @Column()
  expiresAt: Date;

  // @Column()
  // userId: number;

  @ApiProperty({ type: () => User, description: 'The user associated with this verification' })
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ 
    example: 'f391807d-5a63-4c91-9e5c-197e93f6630a', 
    description: 'UUID of the user' 
  })
  @Column('uuid')
  userId: string;
}
