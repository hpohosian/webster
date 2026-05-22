import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Res,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  // ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { GoogleCallbackDto } from './dto/google-callback.dto'; //

import { User } from '../users/entities/user.entity';
import type { Request, Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description:
      'Creates a user and initializes a session. Sends a 6-digit code to email.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created. Session started.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed or email/username taken.',
  })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const user = await this.authService.register(dto);

    req.session.user = {
      id: user.id,
      email: user.email,
    };

    return {
      message: 'Please confirm your email using the 6-digit code sent to you.',
      user: { email: user.email, id: user.id },
    };
  }

  // @Post('verify-email')
  // @ApiOperation({
  //   summary: 'Verify email address',
  //   description:
  //     'Requires an active session. Verifies the user using the code sent to email.',
  // })
  // @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  // @ApiResponse({ status: 400, description: 'Invalid code or missing session.' })
  // async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request) {
  //   if (!req.session.user?.email) {
  //     throw new BadRequestException(
  //       'Email not found in session. Please register first.',
  //     );
  //   }

  //   return this.authService.verifyEmail({ email: dto.email, code: dto.code });
  // }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user and starts a session.',
  })
  @ApiResponse({ status: 200, description: 'Login successful.', type: User })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials.',
  })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.authService.login(dto);

    req.session.user = {
      id: user.id,
      email: user.email,
    };

    return {
      message: 'Logged in successfully',
      user: user,
    };
  }
  // -- for google auth
  @Post('google-callback')
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Exchanges Google auth code for user info, logs in or registers automatically.',
  })
  @ApiResponse({ status: 200, description: 'Logged in successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired Google code.' })
  async googleCallback(
    @Body() dto: GoogleCallbackDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.authService.loginOrRegisterWithGoogle(dto.code);

    req.session.user = {
      id: user.id,
      email: user.email,
    };

    return res.json({
      message: 'Logged in with Google successfully',
      user: { id: user.id, email: user.email },
    });
  }
  // ----

  @Post('password-reset')
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a reset token to the provided email address.',
  })
  @ApiResponse({
    status: 200,
    description: 'If the email exists, a reset link has been sent.',
  })
  requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('password-reset/:token')
  @ApiOperation({
    summary: 'Confirm password reset',
    description: 'Sets a new password using the token from the email.',
  })
  @ApiParam({ name: 'token', type: 'string', description: 'UUID reset token' })
  @ApiResponse({ status: 200, description: 'Password updated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid/expired token or password mismatch.',
  })
  confirmReset(
    @Param('token') token: string,
    @Body() dto: ConfirmPasswordResetDto,
  ) {
    return this.authService.confirmPasswordReset(
      token,
      dto.newPassword,
      dto.newPasswordConfirmation,
    );
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Destroys the current session and clears cookies.',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  @ApiResponse({ status: 400, description: 'No active session found.' })
  logout(@Req() req: Request, @Res() res: Response) {
    if (!req.session || !req.session.user) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'No active session, cannot logout' });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out successfully' });
    });
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns current session user data.',
  })
  @ApiResponse({ status: 200, description: 'Current user data', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized if no session.' })
  getMe(@Req() req: Request) {
    if (!req.session.user) {
      throw new UnauthorizedException('No active session');
    }

    return {
      user: req.session.user,
    };
  }
}
