import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

export class ConfirmPasswordResetDto {
  @ApiProperty({ example: 'newStrongPassword123', minLength: 6 })
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ example: 'newStrongPassword123', minLength: 6 })
  @MinLength(6)
  newPasswordConfirmation: string;
}
