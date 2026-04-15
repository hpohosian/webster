import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { EmailVerification } from '../../email-verifications/entities/email-verification.entity';
import { PasswordReset } from '../../password-resets/entities/password-reset.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class User {
  @ApiProperty({ example: 'f391807d-5a63-4c91-9e5c-197e93f6630a', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'johndoe_88', description: 'Unique username' })
  @Column({ unique: true })
  username: string;

  @Exclude() // Скрывает поле при сериализации в JSON
  @Column()
  passwordHash: string;

  @ApiProperty({ example: 'john@example.com', description: 'Verified email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: 'https://cdn.yourapp.com/avatars/user_1.jpg',
    nullable: true,
    description: 'URL to the profile picture',
  })
  @Column({ nullable: true })
  profilePicture: string;

  @ApiProperty({ description: 'Account creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last profile update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ example: true, description: 'Status of email verification' })
  @Column({ default: false })
  isEmailConfirmed: boolean;

  // --- RELATIONS ---

  // @ApiProperty({ type: () => [Notification], description: 'User notifications' })
  // @OneToMany(() => Notification, (notification) => notification.user)
  // notifications: Notification[];

  @ApiProperty({ type: () => [EmailVerification], description: 'History of email verifications' })
  @OneToMany(() => EmailVerification, (verification) => verification.user)
  emailVerifications: EmailVerification[];

  @ApiProperty({ type: () => [PasswordReset], description: 'History of password reset requests' })
  @OneToMany(() => PasswordReset, (reset) => reset.user)
  passwordResets: PasswordReset[];

  @ApiHideProperty()
  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];
}
