import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { ProjectVersion } from './entities/project-version.entity';
import { FileEntity } from '../files/entities/file.entity';
import { CanvasElement } from '../elements/entities/canvas-element.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      FileEntity,
      ProjectVersion,
      CanvasElement,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
