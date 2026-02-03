import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LinkResponseDto } from '../../links/dto/link-response.dto';
import { AttachmentResponseDto } from '../../attachments/dto/attachment-response.dto';

export class DocumentResponseDto {
  @ApiProperty({
    description: 'Document ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  projectId: string;

  @ApiProperty({
    description: 'Document title',
    example: 'P&ID Drawing - Reactor Section',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Document type',
    example: 'P&ID',
  })
  type?: string;

  @ApiPropertyOptional({
    description: 'Document version',
    example: 'Rev 3.2',
  })
  version?: string;

  @ApiPropertyOptional({
    description: 'File ID reference',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  fileId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { author: 'John Doe', department: 'Engineering' },
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T14:20:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User ID who created the document',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'Links to other entities',
    type: [LinkResponseDto],
  })
  links?: LinkResponseDto[];

  @ApiPropertyOptional({
    description: 'File attachments',
    type: [AttachmentResponseDto],
  })
  attachments?: AttachmentResponseDto[];
}
