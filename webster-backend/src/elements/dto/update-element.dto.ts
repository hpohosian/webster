import {
  IsOptional,
  IsNumber,
  IsString,
  IsObject,
  IsIn,
} from 'class-validator';

export class UpdateElementDto {
  @IsOptional()
  @IsIn(['image', 'text', 'shape'])
  type?: 'image' | 'text' | 'shape';

  @IsOptional()
  @IsNumber()
  x?: number;

  @IsOptional()
  @IsNumber()
  y?: number;

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

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
