import { IsOptional, IsUUID } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
