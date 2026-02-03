import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SearchResultItemDto {
  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Entity type',
    example: 'tag',
  })
  @Expose()
  entityType: string;

  @ApiProperty({
    description: 'Entity name or title',
    example: 'TI-101',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Entity description',
    example: 'Temperature sensor for reactor inlet',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Search relevance rank',
    example: 0.85,
  })
  @Expose()
  rank: number;

  @ApiProperty({
    description: 'Highlighted matching text',
    example: '<mark>Temperature</mark> sensor',
    required: false,
  })
  @Expose()
  highlight?: string;
}

export class SearchResultDto {
  @ApiProperty({
    description: 'Search results',
    type: [SearchResultItemDto],
  })
  @Expose()
  results: SearchResultItemDto[];

  @ApiProperty({
    description: 'Total number of results',
    example: 42,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  @Expose()
  page: number;

  @ApiProperty({
    description: 'Results per page',
    example: 20,
  })
  @Expose()
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  @Expose()
  totalPages: number;
}
