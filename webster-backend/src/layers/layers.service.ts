import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Layer } from './entities/layer.entity';
import { CreateLayerDto } from './dto/create-layer.dto';
import { UpdateLayerDto } from './dto/update-layer.dto';

@Injectable()
export class LayersService {
  constructor(
    @InjectRepository(Layer)
    private readonly layerRepo: Repository<Layer>,
  ) {}

  async create(projectId: string, dto: CreateLayerDto) {
    const count = await this.layerRepo.count({ where: { projectId } });

    const layer = this.layerRepo.create({
      ...dto,
      projectId,
      position: count,
    });

    return this.layerRepo.save(layer);
  }

  async findAll(projectId: string) {
    return this.layerRepo.find({
      where: { projectId },
      order: { position: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateLayerDto) {
    const layer = await this.layerRepo.findOne({ where: { id } });
    if (!layer) throw new NotFoundException('Layer not found');

    Object.assign(layer, dto);
    return this.layerRepo.save(layer);
  }

  async remove(id: string) {
    const layer = await this.layerRepo.delete(id);
    if (!layer.affected) throw new NotFoundException('Layer not found');
    return { success: true };
  }

  async reorder(projectId: string, orderedIds: string[]) {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.layerRepo.update(
        { id: orderedIds[i], projectId },
        { position: i },
      );
    }

    return this.findAll(projectId);
  }
}
