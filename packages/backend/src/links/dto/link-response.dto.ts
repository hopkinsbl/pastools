import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LinkResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the link',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Type of the source entity',
    example: 'tag',
  })
  @Expose()
  sourceEntityType: string;

  @ApiProperty({
    description: 'UUID of the source entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  sourceEntityId: string;

  @ApiProperty({
    description: 'Type of the target entity',
    example: 'equipment',
  })
  @Expose()
  targetEntityType: string;

  @ApiProperty({
    description: 'UUID of the target entity',
    example: '987fcdeb-51a2-43f7-b123-456789abcdef',
  })
  @Expose()
  targetEntityId: string;

  @ApiProperty({
    description: 'Type of link relationship',
    example: 'related_to',
    nullable: true,
  })
  @Expose()
  linkType: string | null;

  @ApiProperty({
    description: 'Description of the link relationship',
    example: 'This tag monitors this equipment',
    nullable: true,
  })
  @Expose()
  description: string | null;

  @ApiProperty({
    description: 'Timestamp when the link was created',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'UUID of the user who created the link',
    example: '456e7890-e89b-12d3-a456-426614174111',
  })
  @Expose()
  createdBy: string;
}
