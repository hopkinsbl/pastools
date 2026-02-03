import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class FileInfoDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  filename: string;

  @ApiProperty()
  @Expose()
  contentType: string;

  @ApiProperty()
  @Expose()
  size: number;

  @ApiProperty()
  @Expose()
  uploadedAt: Date;
}

export class AttachmentResponseDto {
  @ApiProperty({
    description: 'Attachment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Type of entity attached to',
    example: 'tag',
  })
  @Expose()
  entityType: string;

  @ApiProperty({
    description: 'ID of entity attached to',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @Expose()
  entityId: string;

  @ApiProperty({
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @Expose()
  fileId: string;

  @ApiProperty({
    description: 'File information',
    type: FileInfoDto,
  })
  @Expose()
  @Type(() => FileInfoDto)
  file: FileInfoDto;

  @ApiProperty({
    description: 'Attachment description',
    example: 'Equipment specification document',
    nullable: true,
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'ID of user who created the attachment',
  })
  @Expose()
  createdBy: string;
}
