import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity()
export class PasswordReset {
  @ApiProperty({ example: 1, description: 'Unique identifier of the reset record' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => User, description: 'The user requesting the password reset' })
  @ManyToOne(() => User, (user) => user.passwordResets, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ApiProperty({ 
    example: 'a7c...3f1', 
    description: 'Hashed reset token for security' 
  })
  @Column()
  tokenHash: string;

  @ApiProperty({ 
    example: '2026-04-03T12:00:00Z', 
    description: 'Expiration date of the reset link' 
  })
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ApiProperty({ 
    example: false, 
    description: 'Flag indicating if the token has already been used' 
  })
  @Column({ default: false })
  used: boolean;

  @ApiProperty({ description: 'Timestamp when the reset request was created' })
  @CreateDateColumn()
  createdAt: Date;
}
