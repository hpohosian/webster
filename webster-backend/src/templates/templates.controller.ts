import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateFromTemplateDto } from './dto/create-from-template.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard'; // укажи свой путь
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RenameTeplateDto } from './dto/rename-template.dto';

@ApiTags('templates')
// @ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all templates (default + user)' })
  findAll(@Req() req) {
    return this.templatesService.findAll(req.session.user.id);
  }

  @Post(':projectId/save-as-template')
  @ApiOperation({ summary: 'Save existing project as a user template' })
  saveAsTemplate(@Param('projectId') projectId: string, @Req() req) {
    return this.templatesService.saveProjectAsTemplate(projectId, req.session.user.id);
  }

  @Post(':templateId/fork')
  @ApiOperation({ summary: 'Create new project from template' })
  fork(
    @Param('templateId') templateId: string,
    @Body() dto: CreateFromTemplateDto,
    @Req() req,
  ) {
    return this.templatesService.createProjectFromTemplate(
      templateId,
      req.session.user,
      dto.title,
    );
  }

  @Delete(':templateId/template-status')
  @ApiOperation({ summary: 'Remove template status from user template' })
  removeTemplate(@Param('templateId') templateId: string, @Req() req) {
    return this.templatesService.removeTemplateStatus(templateId, req.session.user.id);
  }

  @Patch(':templateId/rename')
  @ApiOperation({ summary: 'Rename user template' })
  rename(
    @Param('templateId') templateId: string,
    @Body() dto: RenameTeplateDto,
    @Req() req,
  ) {
    return this.templatesService.renameTemplate(templateId, req.session.user.id, dto.title);
  }

  @Delete(':templateId')
  @ApiOperation({ summary: 'Delete user template' })
  async delete(@Param('templateId') templateId: string, @Req() req) {
    await this.templatesService.deleteTemplate(templateId, req.session.user.id);
    return { success: true };
  }
}
