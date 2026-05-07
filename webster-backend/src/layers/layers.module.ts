import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Layer } from './entities/layer.entity';
import { LayersService } from './layers.service';
import { LayersController } from './layers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Layer])],
  providers: [LayersService],
  controllers: [LayersController],
})
export class LayersModule {}
