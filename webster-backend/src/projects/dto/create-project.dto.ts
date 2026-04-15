import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsObject } from 'class-validator';

class CanvasDto {
  @ApiProperty({ example: 800 })
  @IsNumber()
  width: number;

  @ApiProperty({ example: 600 })
  @IsNumber()
  height: number;

  @ApiProperty({ example: '#ffffff' })
  @IsString()
  background: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'My project' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: CanvasDto })
  @IsObject()
  canvas: CanvasDto;
}
