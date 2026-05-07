import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { LayersService } from './layers.service';
import { CreateLayerDto } from './dto/create-layer.dto';
import { UpdateLayerDto } from './dto/update-layer.dto';

@Controller('projects/:projectId/layers')
export class LayersController {
  constructor(private readonly layersService: LayersService) {}

  @Post()
  create(@Param('projectId') projectId: string, @Body() dto: CreateLayerDto) {
    return this.layersService.create(projectId, dto);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.layersService.findAll(projectId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLayerDto) {
    return this.layersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.layersService.remove(id);
  }

  @Post('reorder')
  reorder(
    @Param('projectId') projectId: string,
    @Body('orderedIds') orderedIds: string[],
  ) {
    return this.layersService.reorder(projectId, orderedIds);
  }
}
