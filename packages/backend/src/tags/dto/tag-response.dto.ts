import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TagType } from '../../entities/tag.entity';
import { LinkResponseDto } from '../../links/dto/link-response.dto';
import { AttachmentResponseDto } from '../../attachments/dto/attachment-response.dto';

export class TagResponseDto {
  @ApiProperty({
    description: 'Tag ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  projectId: string;

  @ApiProperty({
    description: 'Tag type',
    enum: TagType,
    example: TagType.AI,
  })
  type: TagType;

  @ApiProperty({
    description: 'Tag name',
    example: 'FT-101',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Tag description',
    example: 'Flow transmitter for reactor inlet',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Engineering units',
    example: 'm3/h',
  })
  engineeringUnits?: string;

  @ApiPropertyOptional({
    description: 'Scale low value',
    example: 0,
  })
  scaleLow?: number;

  @ApiPropertyOptional({
    description: 'Scale high value',
    example: 100,
  })
  scaleHigh?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { location: 'Building A', system: 'Cooling' },
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Import lineage information',
    example: {
      sourceFile: 'tags_export.xlsx',
      sheetName: 'AI Tags',
      rowNumber: 42,
    },
  })
  importLineage?: {
    sourceFile?: string;
    sheetName?: string;
    rowNumber?: number;
  };

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
    description: 'User ID who created the tag',
    example: '123e4567-e89b-12d3-a456-426614174002',
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
