import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Full project canvas state',
  })
  @IsObject()
  projectData: any;
}
