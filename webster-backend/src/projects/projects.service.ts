import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../users/entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    const project = this.projectRepository.create({
      title: dto.title,
      projectData: {
        canvas: dto.canvas,
        objects: [],
      },
      user: { id: userId } as User,
    });

    return await this.projectRepository.save(project);
  }

  async findAll(userId: string) {
    return this.projectRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async findOne(projectId: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: {
        id: projectId,
      },
      relations: {
        user: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.user.id !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(projectId: string, dto: any, userId: string) {
    const project = await this.projectRepository.findOne({
      where: {
        id: projectId,
        user: { id: userId },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    project.projectData = dto.projectData;

    return await this.projectRepository.save(project);
  }

  async remove(projectId: string, userId: string) {
    const result = await this.projectRepository.delete({
      id: projectId,
      user: { id: userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Project not found');
    }

    return { message: 'Project deleted successfully' };
  }
}
