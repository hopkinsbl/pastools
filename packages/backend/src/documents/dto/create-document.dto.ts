import { IsString, IsOptional, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Document title',
    example: 'P&ID Drawing - Reactor Section',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Document type',
    example: 'P&ID',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Document version',
    example: 'Rev 3.2',
  })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiPropertyOptional({
    description: 'File ID reference',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  fileId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { author: 'John Doe', department: 'Engineering' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
