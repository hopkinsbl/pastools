import { ApiProperty } from '@nestjs/swagger';

export class ExportResponseDto {
  @ApiProperty({
    description: 'Job ID for tracking export progress',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  jobId: string;

  @ApiProperty({
    description: 'Export status',
    example: 'Queued',
  })
  status: string;

  @ApiProperty({
    description: 'Message',
    example: 'Export job created successfully',
  })
  message: string;
}
