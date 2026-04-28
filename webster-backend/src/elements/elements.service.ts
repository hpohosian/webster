import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CanvasElement } from './entities/canvas-element.entity';

@Injectable()
export class ElementsService {
  constructor(
    @InjectRepository(CanvasElement)
    private readonly canvasElementRepository: Repository<CanvasElement>,
  ) {}

  async create(projectId: string, dto: Partial<CanvasElement>) {
    const element = this.canvasElementRepository.create({
      ...dto,
      projectId,
    });

    return this.canvasElementRepository.save(element);
  }

  async findByProject(projectId: string) {
    return this.canvasElementRepository.find({
      where: { projectId },
      order: { zIndex: 'ASC' },
    });
  }

  async update(id: string, dto: Partial<CanvasElement>) {
    await this.canvasElementRepository.update(id, dto);
    return this.canvasElementRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    return this.canvasElementRepository.delete(id);
  }
}
