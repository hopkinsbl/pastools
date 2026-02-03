import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../projects/guards/project-access.guard';
import { ProjectContext } from '../projects/decorators/project-context.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ValidationService } from './validation.service';
import { ValidationResultResponseDto } from './dto/validation-result-response.dto';
import { RunValidationDto } from './dto/run-validation.dto';

@ApiTags('Validation')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Post('projects/:projectId/validate')
  @UseGuards(ProjectAccessGuard)
  @ApiOperation({ summary: 'Run validation on an entity' })
  @ApiResponse({
    status: 200,
    description: 'Validation results',
    type: [ValidationResultResponseDto],
  })
  async runValidation(
    @ProjectContext() projectId: string,
    @Body() dto: RunValidationDto,
    @CurrentUser() user: any,
  ) {
    const results = await this.validationService.validateEntity(
      {
        projectId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        entity: dto.entity,
      },
      user.id,
    );

    return results;
  }

  @Get('projects/:projectId/validation-results')
  @UseGuards(ProjectAccessGuard)
  @ApiOperation({ summary: 'Get validation results for a project' })
  @ApiResponse({
    status: 200,
    description: 'Validation results',
    type: [ValidationResultResponseDto],
  })
  async getProjectValidationResults(
    @ProjectContext() projectId: string,
    @Query('entityType') entityType?: string,
  ) {
    const results =
      await this.validationService.getProjectValidationResults(
        projectId,
        entityType,
      );
    return results.map((r) => ValidationResultResponseDto.fromEntity(r));
  }

  @Get('projects/:projectId/validation-results/:entityType/:entityId')
  @UseGuards(ProjectAccessGuard)
  @ApiOperation({ summary: 'Get validation results for an entity' })
  @ApiResponse({
    status: 200,
    description: 'Validation results',
    type: [ValidationResultResponseDto],
  })
  async getEntityValidationResults(
    @ProjectContext() projectId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const results = await this.validationService.getValidationResults(
      projectId,
      entityType,
      entityId,
    );
    return results.map((r) => ValidationResultResponseDto.fromEntity(r));
  }

  @Get('projects/:projectId/validation-summary')
  @UseGuards(ProjectAccessGuard)
  @ApiOperation({ summary: 'Get validation summary for a project' })
  @ApiResponse({
    status: 200,
    description: 'Validation summary',
  })
  async getValidationSummary(@ProjectContext() projectId: string) {
    return this.validationService.getValidationSummary(projectId);
  }

  @Post('validation-results/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a validation warning' })
  @ApiResponse({
    status: 200,
    description: 'Acknowledged validation result',
    type: ValidationResultResponseDto,
  })
  async acknowledgeWarning(
    @Param('id') id: string,
  ) {
    const result = await this.validationService.acknowledgeWarning(id);
    return ValidationResultResponseDto.fromEntity(result);
  }
}
