import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanvasElement } from './entities/canvas-element.entity';
import { ElementsService } from './elements.service';
import { ElementsController } from './elements.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CanvasElement])],
  providers: [ElementsService],
  controllers: [ElementsController],
})
export class ElementsModule {}
