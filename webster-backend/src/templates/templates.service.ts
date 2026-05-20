import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TemplatesService implements OnModuleInit {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultTemplates();
  }

  private async seedDefaultTemplates() {
    const templatesDir = path.join(__dirname, '..', '..', 'src', 'templates');

    const dirs = [
      templatesDir,
      path.join(__dirname, 'templates'), // dist/templates
      path.join(process.cwd(), 'src', 'templates'),
    ];

    let jsonFiles: string[] = [];
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        jsonFiles = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        if (jsonFiles.length) {
          for (const file of jsonFiles) {
            const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
            const data = JSON.parse(raw);

            const exists = await this.projectRepo.findOne({
              where: { title: data.title, isDefaultTemplate: true },
            });
            if (!exists) {
              await this.projectRepo.save(
                this.projectRepo.create({
                  title: data.title,
                  type: data.type ?? 'photo',
                  projectData: data.projectData,
                  isTemplate: true,
                  isDefaultTemplate: true,
                }),
              );
            }
          }
          break;
        }
      }
    }
  }

  async findAll(userId: string) {
    const defaultTemplates = await this.projectRepo.find({
      where: { isDefaultTemplate: true, isTemplate: true },
      select: ['id', 'title', 'type', 'projectData', 'thumbnail', 'createdAt'],
    });

    const userTemplates = await this.projectRepo
      .createQueryBuilder('project')
      .leftJoin('project.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('project.isTemplate = true')
      .andWhere('project.isDefaultTemplate = false')
      .select([
        'project.id',
        'project.title',
        'project.type',
        'project.projectData',
        'project.thumbnail',
        'project.createdAt',
      ])
      .getMany();

    return {
      default: defaultTemplates,
      user: userTemplates,
    };
  }

  async saveProjectAsTemplate(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepo
      .createQueryBuilder('project')
      .leftJoin('project.user', 'user')
      .where('project.id = :projectId', { projectId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (!project) throw new NotFoundException('Project not found');

    project.isTemplate = true;
    return this.projectRepo.save(project);
  }

  // Создать новый проект из шаблона (fork)
  async createProjectFromTemplate(
    templateId: string,
    user: User,
    title?: string,
  ): Promise<Project> {
    const template = await this.projectRepo.findOne({
      where: { id: templateId, isTemplate: true },
    });

    if (!template) throw new NotFoundException('Template not found');

    const newProject = this.projectRepo.create({
      title: title ?? `${template.title} (copy)`,
      type: template.type,
      projectData: JSON.parse(JSON.stringify(template.projectData)), // deep copy
      isTemplate: false,
      isDefaultTemplate: false,
      user,
    });

    return this.projectRepo.save(newProject);
  }

  async removeTemplateStatus(templateId: string, userId: string): Promise<Project> {
    const template = await this.projectRepo
      .createQueryBuilder('project')
      .leftJoin('project.user', 'user')
      .where('project.id = :templateId', { templateId })
      .andWhere('user.id = :userId', { userId })
      .andWhere('project.isDefaultTemplate = false')
      .getOne();

    if (!template) throw new NotFoundException('Template not found');

    template.isTemplate = false;
    return this.projectRepo.save(template);
  }
}
