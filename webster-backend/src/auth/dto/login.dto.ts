import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Can be either email or username',
  })
  emailOrUsername: string;

  @ApiProperty({ example: 'strongPassword123' })
  password: string;
}
