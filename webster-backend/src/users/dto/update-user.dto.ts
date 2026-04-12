import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'johndoe_88',
    description: 'Unique public username',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: 'uploads/avatars/user-1.jpg',
    description: 'URL or path to the profile image',
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;
}
