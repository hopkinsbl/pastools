import { IsString, IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TagType } from '../../entities/tag.entity';

export class CreateTagDto {
  @ApiProperty({
    description: 'Tag type',
    enum: TagType,
    example: TagType.AI,
  })
  @IsEnum(TagType)
  type: TagType;

  @ApiProperty({
    description: 'Tag name',
    example: 'FT-101',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Tag description',
    example: 'Flow transmitter for reactor inlet',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Engineering units',
    example: 'm3/h',
  })
  @IsString()
  @IsOptional()
  engineeringUnits?: string;

  @ApiPropertyOptional({
    description: 'Scale low value',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  scaleLow?: number;

  @ApiPropertyOptional({
    description: 'Scale high value',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  scaleHigh?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { location: 'Building A', system: 'Cooling' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Import lineage information',
    example: {
      sourceFile: 'tags_export.xlsx',
      sheetName: 'AI Tags',
      rowNumber: 42,
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
