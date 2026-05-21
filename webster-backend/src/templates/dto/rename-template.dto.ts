import { MinLength, IsString } from 'class-validator';

export class RenameTeplateDto {
  @IsString()
  @MinLength(1)
  title: string;
}
