import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import sharp from 'sharp';
import * as path from 'path';
import { NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  async uploadFile(file: Express.Multer.File, projectId?: string) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const relativePath = `uploads/images/${file.filename}`;
    const metadata = await sharp(relativePath).metadata();

    const newFile = new FileEntity();

    newFile.filename = file.filename;
    newFile.originalName = file.originalname;
    newFile.mimetype = file.mimetype;
    newFile.size = file.size;
    newFile.path = relativePath;
    newFile.width = metadata.width;
    newFile.height = metadata.height;
    if (projectId) {
      newFile.project = { id: projectId } as any;
    }

    const saved = await this.fileRepo.save(newFile);

    return {
      id: saved.id,
      url: `/files/${saved.id}`,
      width: saved.width,
      height: saved.height,
    };
  }

  async getFile(id: string, res: Response) {
    const file = await this.fileRepo.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return res.sendFile(file.path, {
      root: process.cwd(),
    });
  }
}
