import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateImportProfileDto {
  @ApiProperty({
    description: 'Profile name',
    example: 'Standard Tag Import',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Entity type this profile is for',
    example: 'tag',
    enum: ['tag', 'equipment', 'alarm', 'document'],
  })
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @ApiProperty({
    description: 'Column mappings from file columns to entity fields',
    example: {
      'Tag Name': 'name',
      'Description': 'description',
      'Type': 'type',
      'Units': 'engineeringUnits',
    },
  })
  @IsNotEmpty()
  @IsObject()
  columnMappings: Record<string, string>;
}

export class ImportProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  entityType: string;

  @ApiProperty()
  columnMappings: Record<string, string>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: string;
}
