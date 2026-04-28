import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  IsIn,
} from 'class-validator';

export class CreateElementDto {
  @IsString()
  projectId: string;

  @IsIn(['image', 'text', 'shape'])
  type: 'image' | 'text' | 'shape';

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  rotation?: number;

  @IsOptional()
  @IsNumber()
  scale?: number;

  @IsOptional()
  @IsNumber()
  zIndex?: number;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsObject()
  data: Record<string, any>;
}
