import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  Get,
  Param,
  Patch,
  Delete,
  Put,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Project } from './entities/project.entity';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(SessionAuthGuard)
  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
  })
  create(@Body() dto: CreateProjectDto, @Req() req) {
    return this.projectsService.create(dto, req.session.user.id);
  }

  @UseGuards(SessionAuthGuard)
  @Get()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get all projects of current user' })
  @ApiResponse({
    status: 200,
    description: 'List of user projects',
    type: [Project],
  })
  findAll(@Req() req) {
    return this.projectsService.findAll(req.session.user.id);
  }

  @UseGuards(SessionAuthGuard)
  @Get('new/:type')
  async createAndRedirect(@Param('type') type: string, @Req() req, @Res() res: Response) {
    const title = type === 'logo' ? 'Untitled Logo' : 'Untitled Photo';
    const project = await this.projectsService.create(
      { title, canvas: { width: 800, height: 600, background: '#ffffff' } },
      req.session.user.id
    );
    const target = type === 'logo' ? 'logo-maker' : 'edit-page';
    return res.redirect(`http://localhost:5173/${target}/${project.id}`);
  }

  @UseGuards(SessionAuthGuard)
  @Get(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get project by id' })
  @ApiResponse({
    status: 200,
    description: 'Project data',
    type: Project,
  })
  findOne(@Param('id') id: string, @Req() req) {
    return this.projectsService.findOne(id, req.session.user.id);
  }

  @UseGuards(SessionAuthGuard)
  @Patch(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update project (SAVE canvas state)' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: Project,
  })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Req() req) {
    return this.projectsService.update(id, dto, req.session.user.id);
  }

  @UseGuards(SessionAuthGuard)
  @Delete(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  remove(@Param('id') id: string, @Req() req) {
    return this.projectsService.remove(id, req.session.user.id);
  }

  @Post(':id/files')
  async attachFile(
    @Param('id') projectId: string,
    @Body('fileId') fileId: string,
  ) {
    return this.projectsService.attachFile(projectId, fileId);
  }

  @UseGuards(SessionAuthGuard)
  @Put(':id/save')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Save project (manual + autosave)' })
  saveProject(
    @Param('id') id: string,
    @Body() body: { projectState: any; isAutoSave: boolean },
    @Req() req,
  ) {
    return this.projectsService.saveProject(
      id,
      body.projectState,
      body.isAutoSave,
      req.session.user.id,
    );
  }

  @UseGuards(SessionAuthGuard)
  @Post(':id/restore/:versionId')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Restore project to previous version' })
  restoreVersion(
    @Param('id') projectId: string,
    @Param('versionId') versionId: string,
    @Req() req,
  ) {
    return this.projectsService.restoreVersion(
      projectId,
      versionId,
      req.session.user.id,
    );
  }

  @UseGuards(SessionAuthGuard)
  @Get(':id/version-history')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get project version history' })
  getVersionHistory(@Param('id') projectId: string, @Req() req) {
    return this.projectsService.getVersionHistory(
      projectId,
      req.session.user.id,
    );
  }
}
