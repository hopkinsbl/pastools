import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({
    description: 'Type of the source entity (e.g., tag, equipment, alarm)',
    example: 'tag',
  })
  @IsString()
  sourceEntityType: string;

  @ApiProperty({
    description: 'UUID of the source entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  sourceEntityId: string;

  @ApiProperty({
    description: 'Type of the target entity (e.g., equipment, document)',
    example: 'equipment',
  })
  @IsString()
  targetEntityType: string;

  @ApiProperty({
    description: 'UUID of the target entity',
    example: '987fcdeb-51a2-43f7-b123-456789abcdef',
  })
  @IsUUID()
  targetEntityId: string;

  @ApiProperty({
    description: 'Type of link relationship',
    example: 'related_to',
    required: false,
  })
  @IsOptional()
  @IsString()
  linkType?: string;

  @ApiProperty({
    description: 'Description of the link relationship',
    example: 'This tag monitors this equipment',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
