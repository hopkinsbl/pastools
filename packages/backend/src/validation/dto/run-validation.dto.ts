import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';

export class RunValidationDto {
  @ApiProperty({ description: 'Entity type to validate' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'Entity ID to validate', required: false })
  @IsUUID()
  @IsOptional()
  entityId?: string;

  @ApiProperty({ description: 'Entity data to validate' })
  @IsObject()
  entity: any;
}
