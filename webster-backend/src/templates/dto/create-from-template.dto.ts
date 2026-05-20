import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFromTemplateDto {
  @ApiPropertyOptional({ example: 'My holiday card' })
  @IsOptional()
  @IsString()
  title?: string;
}
