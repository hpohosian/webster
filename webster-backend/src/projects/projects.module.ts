import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { ProjectVersion } from './entities/project-version.entity';
import { FileEntity } from '../files/entities/file.entity';
import { CanvasElement } from '../elements/entities/canvas-element.entity';
import { BaseLayer } from '../layers/entities/base-layer.entity';
import { ImageLayer } from '../layers/entities/image-layer.entity';
import { TextLayer } from '../layers/entities/text-layer.entity';
import { ShapeLayer } from '../layers/entities/shape-layer.entity';
import { BackgroundLayer } from '../layers/entities/background-layer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      FileEntity,
      ProjectVersion,
      CanvasElement,
      BaseLayer,
      ImageLayer,
      TextLayer,
      ShapeLayer,
      BackgroundLayer,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
