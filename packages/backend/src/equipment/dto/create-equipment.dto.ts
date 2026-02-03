import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEquipmentDto {
  @ApiProperty({
    description: 'Equipment name',
    example: 'P-101',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Equipment description',
    example: 'Reactor feed pump',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Equipment type',
    example: 'Centrifugal Pump',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Equipment location',
    example: 'Building A, Level 2',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { manufacturer: 'ACME Corp', model: 'XYZ-500' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Import lineage information',
    example: {
      sourceFile: 'equipment_list.xlsx',
      sheetName: 'Pumps',
      rowNumber: 15,
    },
  })
  @IsObject()
  @IsOptional()
  importLineage?: {
    sourceFile?: string;
    sheetName?: string;
    rowNumber?: number;
  };
}
