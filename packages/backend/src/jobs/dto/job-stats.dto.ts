import { ApiProperty } from '@nestjs/swagger';

export class JobStatsDto {
  @ApiProperty({
    description: 'Total number of jobs',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Number of queued jobs',
    example: 5,
  })
  queued: number;

  @ApiProperty({
    description: 'Number of running jobs',
    example: 3,
  })
  running: number;

  @ApiProperty({
    description: 'Number of completed jobs',
    example: 130,
  })
  completed: number;

  @ApiProperty({
    description: 'Number of failed jobs',
    example: 10,
  })
  failed: number;

  @ApiProperty({
    description: 'Number of cancelled jobs',
    example: 2,
  })
  cancelled: number;
}
