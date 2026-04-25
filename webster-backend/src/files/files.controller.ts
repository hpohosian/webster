import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { fileUploadConfig } from './file-upload.config';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload image with optional projectId',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        projectId: {
          type: 'string',
          example: 'uuid-of-project',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      example: {
        id: 'file_uuid',
        url: '/files/file_uuid',
        width: 1920,
        height: 1080,
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', fileUploadConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.filesService.uploadFile(file, body.projectId);
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    return this.filesService.getFile(id, res);
  }
}
