import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class StartImportDto {
  @ApiProperty({
    description: 'Uploaded file path or ID',
    example: '/tmp/upload/tags.xlsx',
  })
  @IsNotEmpty()
  @IsString()
  filePath: string;

  @ApiProperty({
    description: 'File type (csv or xlsx)',
    example: 'xlsx',
    enum: ['csv', 'xlsx'],
  })
  @IsNotEmpty()
  @IsString()
  fileType: 'csv' | 'xlsx';

  @ApiProperty({
    description: 'Sheet name to import (for XLSX files)',
    example: 'Tags',
  })
  @IsNotEmpty()
  @IsString()
  sheetName: string;

  @ApiProperty({
    description: 'Entity type to import',
    example: 'tag',
    enum: ['tag', 'equipment', 'alarm', 'document'],
  })
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @ApiProperty({
    description: 'Column mappings from file columns to entity fields',
    example: {
      'Tag Name': 'name',
      'Description': 'description',
    },
  })
  @IsNotEmpty()
  columnMappings: Record<string, string>;

  @ApiProperty({
    description: 'Optional import profile ID to use',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  profileId?: string;
}
