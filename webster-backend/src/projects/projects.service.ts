import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../users/entities/user.entity';
import { FileEntity } from '../files/entities/file.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    const project = this.projectRepo.create({
      title: dto.title,
      projectData: {
        canvas: dto.canvas,
        objects: [],
      },
      user: { id: userId } as User,
    });

    return await this.projectRepo.save(project);
  }

  async findAll(userId: string) {
    return this.projectRepo.find({
      where: { user: { id: userId } },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(projectId: string, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: { user: true },
    });

    if (!project) throw new NotFoundException('Project not found');
    if (project.user.id !== userId) throw new ForbiddenException('No access');

    return project;
  }

  async update(projectId: string, dto: any, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, user: { id: userId } },
    });

    if (!project) throw new NotFoundException('Project not found');
    project.projectData = dto.projectData;

    return await this.projectRepo.save(project);
  }

  async remove(projectId: string, userId: string) {
    const result = await this.projectRepo.delete({
      id: projectId,
      user: { id: userId },
    });

    if (result.affected === 0) throw new NotFoundException('Project not found');
    return { message: 'Project deleted successfully' };
  }

  async attachFile(projectId: string, fileId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundException('Project not found');

    const file = await this.fileRepo.findOne({
      where: { id: fileId },
    });

    if (!file) throw new NotFoundException('File not found');

    file.project = project;
    return this.fileRepo.save(file);
  }
}
