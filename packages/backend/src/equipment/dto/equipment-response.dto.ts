import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LinkResponseDto } from '../../links/dto/link-response.dto';
import { AttachmentResponseDto } from '../../attachments/dto/attachment-response.dto';

export class EquipmentResponseDto {
  @ApiProperty({
    description: 'Equipment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  projectId: string;

  @ApiProperty({
    description: 'Equipment name',
    example: 'P-101',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Equipment description',
    example: 'Reactor feed pump',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Equipment type',
    example: 'Centrifugal Pump',
  })
  type?: string;

  @ApiPropertyOptional({
    description: 'Equipment location',
    example: 'Building A, Level 2',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { manufacturer: 'ACME Corp', model: 'XYZ-500' },
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Import lineage information',
    example: {
      sourceFile: 'equipment_list.xlsx',
      sheetName: 'Pumps',
      rowNumber: 15,
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
    description: 'User ID who created the equipment',
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
