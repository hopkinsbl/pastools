import { ApiProperty } from '@nestjs/swagger';
import { JobType, JobStatus } from '../../entities/job.entity';

export class JobResponseDto {
  @ApiProperty({
    description: 'Job ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Job type',
    enum: JobType,
    example: JobType.IMPORT,
  })
  type: JobType;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Project name',
    example: 'Plant A Commissioning',
    required: false,
  })
  projectName?: string;

  @ApiProperty({
    description: 'Job status',
    enum: JobStatus,
    example: JobStatus.RUNNING,
  })
  status: JobStatus;

  @ApiProperty({
    description: 'Job progress percentage (0-100)',
    example: 45,
  })
  progress: number;

  @ApiProperty({
    description: 'Job result data',
    required: false,
    example: { recordsProcessed: 100, recordsCreated: 95, errors: 5 },
  })
  result?: Record<string, any>;

  @ApiProperty({
    description: 'Error message if job failed',
    required: false,
    example: 'Failed to parse CSV file',
  })
  error?: string;

  @ApiProperty({
    description: 'Job creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Job start timestamp',
    required: false,
    example: '2024-01-15T10:30:05Z',
  })
  startedAt?: string;

  @ApiProperty({
    description: 'Job completion timestamp',
    required: false,
    example: '2024-01-15T10:35:00Z',
  })
  completedAt?: string;

  @ApiProperty({
    description: 'User ID who created the job',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  createdBy: string;

  @ApiProperty({
    description: 'Name of user who created the job',
    required: false,
    example: 'John Doe',
  })
  createdByName?: string;
}
