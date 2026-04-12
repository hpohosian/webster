import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { EmailVerificationsModule } from '../email-verifications/email-verifications.module';
import { MailModule } from '../mail/mail.module';
import { PasswordResetsModule } from '../password-resets/password-resets.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User]),
    EmailVerificationsModule,
    MailModule,
    PasswordResetsModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
