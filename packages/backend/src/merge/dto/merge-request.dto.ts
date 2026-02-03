import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, IsUUID } from 'class-validator';
import { MergeStrategy } from '../interfaces/merge-strategy.interface';

export class MergeRequestDto {
  @ApiProperty({ description: 'Entity type to merge' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'Source entity ID (will be deleted after merge)' })
  @IsUUID()
  sourceEntityId: string;

  @ApiProperty({ description: 'Target entity ID (will be kept and updated)' })
  @IsUUID()
  targetEntityId: string;

  @ApiProperty({ 
    description: 'Merge strategy', 
    enum: MergeStrategy,
    example: MergeStrategy.MERGE_FIELDS 
  })
  @IsEnum(MergeStrategy)
  strategy: MergeStrategy;

  @ApiProperty({ 
    description: 'Field selections for MERGE_FIELDS strategy (field name -> "source" or "target")',
    required: false,
    example: { name: 'source', description: 'target' }
  })
  @IsOptional()
  @IsObject()
  fieldSelections?: Record<string, 'source' | 'target'>;
}

export class MergeResultDto {
  @ApiProperty({ description: 'Whether merge was successful' })
  success: boolean;

  @ApiProperty({ description: 'ID of the merged entity' })
  mergedEntityId: string;

  @ApiProperty({ description: 'Number of links preserved' })
  preservedLinks: number;

  @ApiProperty({ description: 'Number of attachments preserved' })
  preservedAttachments: number;

  @ApiProperty({ description: 'Audit log entry ID' })
  auditLogId: string;

  @ApiProperty({ description: 'Error message if merge failed', required: false })
  error?: string;
}
