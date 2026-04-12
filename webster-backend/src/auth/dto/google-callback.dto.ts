import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleCallbackDto {
  @ApiProperty({
    example: '4/0Aci98...',
    description: 'Authorization code from Google',
  })
  @IsString()
  code: string;
}
