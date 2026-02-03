import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../projects/guards/project-access.guard';
import { ProjectContext } from '../projects/decorators/project-context.decorator';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto } from './dto/search-result.dto';

@ApiTags('Search')
@Controller('api/projects/:projectId/search')
@UseGuards(JwtAuthGuard, ProjectAccessGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search across all entities',
    description:
      'Performs full-text search across tags, equipment, documents, technical queries, and punchlist items',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query string',
    required: true,
    example: 'temperature sensor',
  })
  @ApiQuery({
    name: 'entityType',
    description: 'Filter by entity type',
    required: false,
    enum: ['tag', 'equipment', 'document', 'technical_query', 'punchlist_item'],
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number (1-based)',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Results per page (max 100)',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results with pagination',
    type: SearchResultDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to this project',
  })
  async search(
    @ProjectContext() projectId: string,
    @Query() query: SearchQueryDto,
  ): Promise<SearchResultDto> {
    return this.searchService.search(projectId, query);
  }
}
