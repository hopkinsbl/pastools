import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class DuplicateMatchRuleDto {
  @ApiProperty({ description: 'Entity type to check for duplicates' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'Fields to compare for duplicate detection', type: [String] })
  @IsArray()
  @IsString({ each: true })
  matchFields: string[];

  @ApiProperty({ description: 'Whether matching is case sensitive', required: false })
  @IsOptional()
  @IsBoolean()
  caseSensitive?: boolean;

  @ApiProperty({ description: 'Whether to use exact matching', required: false })
  @IsOptional()
  @IsBoolean()
  exactMatch?: boolean;

  @ApiProperty({ description: 'Similarity threshold for fuzzy matching (0-1)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  similarityThreshold?: number;
}

export class DetectDuplicatesDto {
  @ApiProperty({ description: 'Entity type to check' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'Match rules for duplicate detection', type: DuplicateMatchRuleDto })
  @IsOptional()
  matchRule?: DuplicateMatchRuleDto;

  @ApiProperty({ description: 'Entities to check for duplicates', type: [Object] })
  @IsArray()
  entities: any[];
}

export class DuplicateCandidateDto {
  @ApiProperty({ description: 'Existing entity in the system' })
  existingEntity: any;

  @ApiProperty({ description: 'New entity being imported' })
  newEntity: any;

  @ApiProperty({ description: 'Match score (0-1)' })
  matchScore: number;

  @ApiProperty({ description: 'Fields that matched', type: [String] })
  matchedFields: string[];
}
