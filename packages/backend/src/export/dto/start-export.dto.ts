import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
}

export enum ExportEntityType {
  TAG = 'tag',
  EQUIPMENT = 'equipment',
  ALARM = 'alarm',
  DOCUMENT = 'document',
  TECHNICAL_QUERY = 'tq',
  PUNCHLIST = 'punchlist',
}

export class StartExportDto {
  @ApiProperty({
    description: 'Entity type to export',
    example: 'tag',
    enum: ExportEntityType,
  })
  @IsNotEmpty()
  @IsEnum(ExportEntityType)
  entityType: ExportEntityType;

  @ApiProperty({
    description: 'Export format',
    example: 'xlsx',
    enum: ExportFormat,
  })
  @IsNotEmpty()
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiProperty({
    description: 'Columns to include in export',
    example: ['name', 'description', 'type', 'engineeringUnits'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  columns: string[];

  @ApiProperty({
    description: 'Optional filter criteria',
    required: false,
    example: { type: 'AI', status: 'active' },
  })
  @IsOptional()
  filters?: Record<string, any>;
}
