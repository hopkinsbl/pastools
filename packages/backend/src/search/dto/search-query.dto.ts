import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchEntityType {
  TAG = 'tag',
  EQUIPMENT = 'equipment',
  DOCUMENT = 'document',
  TECHNICAL_QUERY = 'technical_query',
  PUNCHLIST_ITEM = 'punchlist_item',
}

export class SearchQueryDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'temperature sensor',
  })
  @IsString()
  q: string;

  @ApiProperty({
    description: 'Filter by entity type',
    enum: SearchEntityType,
    required: false,
  })
  @IsOptional()
  @IsEnum(SearchEntityType)
  entityType?: SearchEntityType;

  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Results per page',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
