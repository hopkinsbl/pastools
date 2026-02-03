import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Job, JobStatus } from '../entities/job.entity';
import { JobResponseDto } from './dto/job-response.dto';
import { JobStatsDto } from './dto/job-stats.dto';

@ApiTags('Jobs')
@Controller('api/jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: JobStatus,
    description: 'Filter by job status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of jobs',
    type: [JobResponseDto],
  })
  async getAllJobs(
    @Query('status') status?: JobStatus,
  ): Promise<JobResponseDto[]> {
    const jobs = await this.jobsService.getAllJobs(status);
    return jobs.map((job) => this.mapToDto(job));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({
    status: 200,
    description: 'Job details',
    type: JobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJob(@Param('id') id: string): Promise<JobResponseDto> {
    const job = await this.jobsService.getJob(id);
    return this.mapToDto(job);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a running job' })
  @ApiResponse({
    status: 200,
    description: 'Job cancelled successfully',
    type: JobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 400, description: 'Job cannot be cancelled' })
  async cancelJob(@Param('id') id: string): Promise<JobResponseDto> {
    try {
      const job = await this.jobsService.cancelJob(id);
      return this.mapToDto(job);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry a failed job' })
  @ApiResponse({
    status: 200,
    description: 'Job queued for retry',
    type: JobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 400, description: 'Job cannot be retried' })
  async retryJob(@Param('id') id: string): Promise<JobResponseDto> {
    try {
      const job = await this.jobsService.retryJob(id);
      return this.mapToDto(job);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get all jobs for a project' })
  @ApiResponse({
    status: 200,
    description: 'List of project jobs',
    type: [JobResponseDto],
  })
  async getProjectJobs(
    @Param('projectId') projectId: string,
  ): Promise<JobResponseDto[]> {
    const jobs = await this.jobsService.getProjectJobs(projectId);
    return jobs.map((job) => this.mapToDto(job));
  }

  @Get('projects/:projectId/stats')
  @ApiOperation({ summary: 'Get job statistics for a project' })
  @ApiResponse({
    status: 200,
    description: 'Job statistics',
    type: JobStatsDto,
  })
  async getProjectJobStats(
    @Param('projectId') projectId: string,
  ): Promise<JobStatsDto> {
    return this.jobsService.getProjectJobStats(projectId);
  }

  private mapToDto(job: Job): JobResponseDto {
    return {
      id: job.id,
      type: job.type,
      projectId: job.projectId,
      projectName: job.project?.name,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt.toISOString(),
      startedAt: job.startedAt?.toISOString(),
      completedAt: job.completedAt?.toISOString(),
      createdBy: job.createdBy,
      createdByName: job.createdByUser?.fullName || job.createdByUser?.username,
    };
  }
}
