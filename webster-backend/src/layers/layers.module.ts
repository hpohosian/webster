import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LayersService } from './layers.service';
import { LayersController } from './layers.controller';

import { BaseLayer } from './entities/base-layer.entity';
import { ImageLayer } from './entities/image-layer.entity';
import { TextLayer } from './entities/text-layer.entity';
import { ShapeLayer } from './entities/shape-layer.entity';
import { BackgroundLayer } from './entities/background-layer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
      BaseLayer,
      ImageLayer,
      TextLayer,
      ShapeLayer,
      BackgroundLayer,
   ])],
  providers: [LayersService],
  controllers: [LayersController],
})
export class LayersModule {}
