import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Res,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../projects/guards/project-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProjectContext } from '../projects/decorators/project-context.decorator';
import { ExportService } from './export.service';
import { StartExportDto } from './dto/start-export.dto';
import { ExportResponseDto } from './dto/export-response.dto';
import * as fs from 'fs';

@ApiTags('Export')
@Controller('api/projects/:projectId/export')
@UseGuards(JwtAuthGuard, ProjectAccessGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @ApiOperation({ summary: 'Start export job' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 201,
    description: 'Export job created successfully',
    type: ExportResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async startExport(
    @ProjectContext() projectId: string,
    @CurrentUser() user: any,
    @Body() exportDto: StartExportDto,
  ): Promise<ExportResponseDto> {
    const job = await this.exportService.startExport(
      projectId,
      user.userId,
      exportDto,
    );

    return {
      jobId: job.id,
      status: job.status,
      message: 'Export job created successfully',
    };
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get export job status' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job status retrieved' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobStatus(
    @ProjectContext() projectId: string,
    @Param('jobId') jobId: string,
  ) {
    const job = await this.exportService.getJobStatus(jobId);

    // Verify job belongs to this project
    if (job.projectId !== projectId) {
      throw new NotFoundException('Job not found');
    }

    return {
      id: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };
  }

  @Get('jobs/:jobId/download')
  @ApiOperation({ summary: 'Download export file' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'File download' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadExport(
    @ProjectContext() projectId: string,
    @Param('jobId') jobId: string,
    @Res() res: Response,
  ) {
    const job = await this.exportService.getJobStatus(jobId);

    // Verify job belongs to this project
    if (job.projectId !== projectId) {
      throw new NotFoundException('Job not found');
    }

    const { filePath, fileName } = await this.exportService.getExportFile(jobId);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Export file not found');
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
