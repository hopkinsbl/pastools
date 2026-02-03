import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttachmentDto {
  @ApiProperty({
    description: 'Type of entity to attach to (e.g., tag, equipment, alarm)',
    example: 'tag',
  })
  @IsString()
  entityType: string;

  @ApiProperty({
    description: 'ID of the entity to attach to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  entityId: string;

  @ApiProperty({
    description: 'ID of the file to attach',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  fileId: string;

  @ApiProperty({
    description: 'Optional description of the attachment',
    example: 'Equipment specification document',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
