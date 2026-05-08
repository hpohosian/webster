import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseLayer } from './entities/base-layer.entity';
import { ImageLayer } from './entities/image-layer.entity';
import { TextLayer } from './entities/text-layer.entity';
import { ShapeLayer } from './entities/shape-layer.entity';
import { BackgroundLayer } from './entities/background-layer.entity';

import { CreateLayerDto } from './dto/create-layer.dto';
import { UpdateLayerDto } from './dto/update-layer.dto';

@Injectable()
export class LayersService {
  constructor(
    @InjectRepository(BaseLayer)
    private readonly layerRepo: Repository<BaseLayer>,
  ) {}

  // ─────────────────────────────
  // CREATE
  // ─────────────────────────────
  async create(projectId: string, dto: CreateLayerDto) {
    const count = await this.layerRepo.count({ where: { projectId } });

    let layer: BaseLayer;

    switch (dto.type) {
      case 'image': {
        const img = new ImageLayer();
        img.src = (dto as any).src;
        img.width = (dto as any).width;
        img.height = (dto as any).height;
        layer = img;
        break;
      }

      case 'text': {
        const text = new TextLayer();
        text.text = (dto as any).text;
        text.fontSize = (dto as any).fontSize ?? 32;
        text.color = (dto as any).color ?? '#000000';
        layer = text;
        break;
      }

      case 'shape': {
        const shape = new ShapeLayer();
        shape.shapeType = (dto as any).shapeType;
        shape.fill = (dto as any).fill ?? '#000000';
        layer = shape;
        break;
      }

      default: {
        // background или fallback
        const bg = new BackgroundLayer();
        bg.color = '#ffffff';
        bg.width = (dto as any).width;
        bg.height = (dto as any).height;
        layer = bg;
      }
    }

    layer.projectId = projectId;
    layer.name = dto.name;
    layer.visible = dto.visible ?? true;
    layer.locked = dto.locked ?? false;
    layer.opacity = dto.opacity ?? 100;
    layer.blendMode = dto.blendMode ?? 'normal';
    layer.position = count;

    return this.layerRepo.save(layer);
  }

  // ─────────────────────────────
  // GET ALL
  // ─────────────────────────────
  async findAll(projectId: string) {
    return this.layerRepo.find({
      where: { projectId },
      order: { position: 'ASC' },
    });
  }

  // ─────────────────────────────
  // UPDATE
  // ─────────────────────────────
  async update(projectId: string, id: string, dto: UpdateLayerDto) {
    const layer = await this.layerRepo.findOne({
      where: { id, projectId },
    });

    if (!layer) {
      throw new NotFoundException('Layer not found');
    }

    Object.assign(layer, dto);

    return this.layerRepo.save(layer);
  }

  // ─────────────────────────────
  // DELETE
  // ─────────────────────────────
  async remove(projectId: string, id: string) {
    const result = await this.layerRepo.delete({ id, projectId });

    if (!result.affected) {
      throw new NotFoundException('Layer not found');
    }

    return { success: true };
  }

  // ─────────────────────────────
  // REORDER
  // ─────────────────────────────
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
