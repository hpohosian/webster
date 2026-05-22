import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleCallbackDto } from './dto/google-callback.dto';
import { EmailVerificationsService } from '../email-verifications/email-verifications.service';
import { PasswordResetsService } from '../password-resets/password-resets.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from 'src/users/enums/user-role.enum';

// for google auth
// import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userService: Repository<User>,
    private emailVerificationService: EmailVerificationsService,
    private mailService: MailService,
    private passwordResetsService: PasswordResetsService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const { username, email, password, passwordConfirmation } = dto;

    if (password !== passwordConfirmation) {
      throw new BadRequestException("Passwords don't match");
    }

    const existingUserByUsername = await this.userService.findOne({
      where: { username },
    });

    if (existingUserByUsername && existingUserByUsername.isEmailConfirmed) {
      throw new BadRequestException('Username already taken');
    }

    const existingUserByEmail = await this.userService.findOne({
      where: { email },
    });

    if (existingUserByEmail && existingUserByEmail.isEmailConfirmed) {
      throw new BadRequestException('Email already registered');
    }

    const hash: string = await bcrypt.hash(password, 10);

    const user = this.userService.create({
      username,
      email,
      passwordHash: hash,
      profilePicture: 'uploads/avatars/default.png',
      isEmailConfirmed: false,
    });

    const savedUser = await this.userService.save(user);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.emailVerificationService.create(savedUser.id, token, expiresAt);

    const verifyLink = `${process.env.PORT}/verify-email?token=${token}`;
    await this.mailService.sendVerification(savedUser.email, verifyLink);

    return savedUser;
  }

  async verifyEmail(token: string) {
    const verification = await this.emailVerificationService.findByCode(token);
    if (!verification) throw new BadRequestException('Invalid token');
    if (verification.expiresAt < new Date()) throw new BadRequestException('Token expired');

    const user = await this.userService.findOne({ where: { id: verification.userId } });
    if (!user) throw new BadRequestException('User not found'); // фикс null

    user.isEmailConfirmed = true;
    await this.userService.save(user);
    await this.emailVerificationService.deleteByUserId(user.id);

    return { message: 'Email confirmed', userId: user.id };
  }

  async login(dto: LoginDto) {
    const { emailOrUsername, password } = dto;

    const user = await this.userService.findOne({
      where: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) throw new BadRequestException('User not found');

    if (!user.isEmailConfirmed) {
      throw new BadRequestException('Email not confirmed');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new BadRequestException('Invalid password');

    return user;
  }

  // google auth
  async loginOrRegisterWithGoogle(code: string) {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI, // e.g. http://localhost:5173/auth/callback
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    console.log('Token response:', tokenData );
    const access_token = tokenData.access_token;
    if (!access_token) {
      throw new BadRequestException('Failed to get Google access token: ' + JSON.stringify(tokenData));
    }
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

    const { email, given_name, family_name } = await profileRes.json();

    let user = await this.userService.findOne({ where: { email } });

    if (!user) {
      user = this.userService.create({
        email,
        username: email.split('@')[0],
        isEmailConfirmed: true, // match your actual entity field name
        passwordHash: '',
        profilePicture: 'uploads/avatars/default.png',
      });
      user = await this.userService.save(user);
    }

    return user;
  }
  //
  async requestPasswordReset(email: string) {
    const user = await this.userService.findOne({
      where: { email },
    });

    if (!user) {
      return {
        message: `Email ${email} does not exist`,
      };
    }

    await this.passwordResetsService.deleteUserTokens(user);

    const token = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.passwordResetsService.create(user, tokenHash, expiresAt);

    const resetLink = `${process.env.PORT}/password-reset/${token}`;

    await this.mailService.sendPasswordReset(user.email, resetLink);

    return {
      message: `Password reset link sent`,
    };
  }

  async confirmPasswordReset(
    token: string,
    newPassword: string,
    newPasswordConfirmation: string,
  ) {
    if (!newPassword) {
      throw new BadRequestException('Password is required');
    }
    if (newPassword !== newPasswordConfirmation) {
      throw new BadRequestException("Passwords don't match");
    }
    if (newPassword.length < 6) {
      throw new BadRequestException(
        'Password must contain at least 6 characters',
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const reset = await this.passwordResetsService.findByHash(tokenHash);

    if (!reset) throw new BadRequestException('Invalid token');
    if (reset.used) throw new BadRequestException('Token already used');
    if (reset.expiresAt < new Date())
      throw new BadRequestException('Token expired');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    reset.user.passwordHash = hashedPassword;
    await this.userService.save(reset.user);

    await this.passwordResetsService.markUsed(reset);

    return { message: 'Password reset successful' };
  }
}
