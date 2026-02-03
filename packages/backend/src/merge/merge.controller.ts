import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../projects/guards/project-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProjectContext } from '../projects/decorators/project-context.decorator';
import { MergeService } from './merge.service';
import {
  DetectDuplicatesDto,
  DuplicateCandidateDto,
} from './dto/duplicate-detection.dto';
import { MergeRequestDto, MergeResultDto } from './dto/merge-request.dto';

@ApiTags('Merge')
@Controller('api/projects/:projectId/merge')
@UseGuards(JwtAuthGuard, ProjectAccessGuard)
@ApiBearerAuth()
export class MergeController {
  constructor(private readonly mergeService: MergeService) {}

  @Post('detect-duplicates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detect duplicate entities' })
  @ApiResponse({
    status: 200,
    description: 'Duplicate candidates found',
    type: [DuplicateCandidateDto],
  })
  async detectDuplicates(
    @ProjectContext() projectId: string,
    @Body() dto: DetectDuplicatesDto,
  ): Promise<DuplicateCandidateDto[]> {
    const duplicates = await this.mergeService.detectDuplicates(
      projectId,
      dto.entityType,
      dto.entities,
      dto.matchRule,
    );

    return duplicates.map((dup) => ({
      existingEntity: dup.existingEntity,
      newEntity: dup.newEntity,
      matchScore: dup.matchScore,
      matchedFields: dup.matchedFields,
    }));
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge two entities' })
  @ApiResponse({
    status: 200,
    description: 'Entities merged successfully',
    type: MergeResultDto,
  })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  @ApiResponse({ status: 400, description: 'Invalid merge request' })
  async mergeEntities(
    @CurrentUser() user: any,
    @Body() dto: MergeRequestDto,
  ): Promise<MergeResultDto> {
    const result = await this.mergeService.mergeEntities(dto, user.id);
    return result;
  }
}
