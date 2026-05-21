import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/entities/user.entity';
import { FileEntity } from '../files/entities/file.entity';
import { ProjectVersion } from './entities/project-version.entity';
import { BaseLayer } from '../layers/entities/base-layer.entity';
import { BackgroundLayer } from '../layers/entities/background-layer.entity';

type VersionGroup = {
  type: 'autosave' | 'manual';
  versions: {
    id: string;
    versionNumber?: number;
    createdAt?: Date;
  }[];
};

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(ProjectVersion)
    private readonly versionRepo: Repository<ProjectVersion>,

    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,

    @InjectRepository(BaseLayer)
    private readonly layerRepo: Repository<BaseLayer>,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    const project = this.projectRepo.create({
      title: dto.title,
      projectData: {
        canvas: dto.canvas,
        objects: [],
      },
      user: { id: userId } as User,
      isTemplate: false,
      isDefaultTemplate: false,
    });

    const savedProject = await this.projectRepo.save(project);

    const backgroundLayer = new BackgroundLayer();

    backgroundLayer.projectId = savedProject.id;
    backgroundLayer.name = 'Background';
    backgroundLayer.visible = true;
    backgroundLayer.locked = true;
    backgroundLayer.opacity = 100;
    backgroundLayer.blendMode = 'normal';

    backgroundLayer.position = 0;

    backgroundLayer.x = 0;
    backgroundLayer.y = 0;

    backgroundLayer.color = dto.canvas.background;

    backgroundLayer.type = 'background';

    if (backgroundLayer.name === 'Background') {
      backgroundLayer.width = undefined;
      backgroundLayer.height = undefined;
    } else {
      backgroundLayer.width = dto.canvas.width;
      backgroundLayer.height = dto.canvas.height;
    }

    await this.layerRepo.save(backgroundLayer);

    // console.log(savedProject);
    // console.log(backgroundLayer);

    return savedProject;
  }

  async findAll(userId: string) {
    return this.projectRepo.find({
      where: {
        user: { id: userId },
        isTemplate: false,
      },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(projectId: string, userId: string) {
    const project = await this.projectRepo.findOne({
      where: {
        id: projectId,
      },
      relations: { user: true },
    });

    if (!project) throw new NotFoundException('Project not found');
    if (project.user.id !== userId) throw new ForbiddenException('No access');

    return project;
  }

  async update(projectId: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, user: { id: userId }, isDefaultTemplate: false },
    });

    if (!project) throw new NotFoundException('Project not found');

    if (dto.title !== undefined) {
      project.title = dto.title;
    }

    return await this.projectRepo.save(project);
  }

  async remove(projectId: string, userId: string) {
    const result = await this.projectRepo.delete({
      id: projectId,
      user: { id: userId },
      isDefaultTemplate: false,
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

  async saveProject(
    projectId: string,
    projectState: any,
    isAutoSave: boolean,
    userId: string,
    thumbnail?: string,
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, user: { id: userId } },
    });

    if (!project) throw new NotFoundException('Project not found');

    const lastVersion = await this.versionRepo.findOne({
      where: { projectId },
      order: { versionNumber: 'DESC' },
    });

    const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    const version = this.versionRepo.create({
      projectId,
      data: projectState,
      versionNumber: nextVersionNumber,
      isAutoSave,
    });

    const savedVersion = await this.versionRepo.save(version);

    project.currentVersionId = savedVersion.id;
    project.projectData = projectState;
    if (thumbnail) {
      project.thumbnail = thumbnail;
    }

    await this.projectRepo.save(project);

    return {
      version: savedVersion,
      versionNumber: nextVersionNumber,
      projectthumbnail: project.thumbnail,
    };
  }

  async restoreVersion(projectId: string, versionId: string, userId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, user: { id: userId } },
    });

    if (!project) throw new NotFoundException('Project not found');

    const versionToRestore = await this.versionRepo.findOne({
      where: { id: versionId, projectId },
    });

    if (!versionToRestore) {
      throw new NotFoundException('Version not found');
    }

    const lastVersion = await this.versionRepo.findOne({
      where: { projectId },
      order: { versionNumber: 'DESC' },
    });

    const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    const newVersion = this.versionRepo.create({
      projectId,
      data: versionToRestore.data,
      versionNumber: nextVersionNumber,
      isAutoSave: false,
    });

    const savedVersion = await this.versionRepo.save(newVersion);

    project.projectData = versionToRestore.data;
    project.currentVersionId = savedVersion.id;

    await this.projectRepo.save(project);

    return {
      restoredFrom: versionId,
      newVersion: savedVersion,
    };
  }

  private groupVersions(versions: any[]) {
    const result: any[] = [];

    let currentGroup: VersionGroup | null = null;

    for (const v of versions) {
      const type = v.isAutoSave ? 'autosave' : 'manual';

      if (currentGroup && currentGroup.type === type) {
        currentGroup.versions.push(this.mapVersion(v));
      } else {
        currentGroup = {
          type,
          versions: [this.mapVersion(v)],
        };

        result.push(currentGroup);
      }
    }

    return result;
  }

  private mapVersion(v: any) {
    return {
      id: v.id,
      versionNumber: v.versionNumber,
      createdAt: v.createdAt,
    };
  }

  async getVersionHistory(
    projectId: string,
    userId: string,
    page = 1,
    limit = 20,
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, user: { id: userId } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const [versions, total] = await this.versionRepo.findAndCount({
      where: { projectId },
      order: { versionNumber: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const grouped = this.groupVersions(versions);

    return {
      data: grouped,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
