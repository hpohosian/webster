import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateLayerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type?: "image" | "text" | "shape";

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
}
