import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateLayerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type?: "image" | "text" | "shape" | "background";

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @IsOptional()
  @IsNumber()
  opacity?: number;

  @IsOptional()
  @IsString()
  blendMode?: string;

  @IsOptional()
  @IsString()
  src?: string;

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
}
