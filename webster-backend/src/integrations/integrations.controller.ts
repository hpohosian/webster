import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';

@ApiTags('External integrations')
@Controller('api')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check external integration key availability' })
  health() {
    return this.integrationsService.health();
  }

  @Get('images/search')
  @ApiOperation({ summary: 'Search images through Unsplash' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'query', required: false })
  searchImages(@Query('q') q?: string, @Query('query') query?: string) {
    return this.integrationsService.searchImages(q || query || 'design');
  }

  @Get('fonts')
  @ApiOperation({ summary: 'List Google Fonts' })
  @ApiQuery({ name: 'limit', required: false })
  listFonts(@Query('limit') limit?: string) {
    return this.integrationsService.listFonts(limit);
  }

  @Get('icons/search')
  @ApiOperation({ summary: 'Search free SVG icons through Iconify' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'limit', required: false })
  searchIcons(
    @Query('q') q?: string,
    @Query('query') query?: string,
    @Query('limit') limit?: string,
  ) {
    return this.integrationsService.searchIcons(q || query || 'logo', limit);
  }

  @Get('colors/palette')
  @ApiOperation({ summary: 'Generate a palette through The Color API' })
  @ApiQuery({ name: 'hex', required: false })
  @ApiQuery({ name: 'mode', required: false })
  @ApiQuery({ name: 'count', required: false })
  getPalette(
    @Query('hex') hex?: string,
    @Query('mode') mode?: string,
    @Query('count') count?: string,
  ) {
    return this.integrationsService.getPalette(hex, mode, count);
  }
}
