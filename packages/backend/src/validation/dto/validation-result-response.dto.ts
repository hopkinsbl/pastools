import { ApiProperty } from '@nestjs/swagger';
import { ValidationResult } from '../../entities/validation-result.entity';

export class ValidationResultResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  entityType: string;

  @ApiProperty()
  entityId: string;

  @ApiProperty()
  ruleName: string;

  @ApiProperty({ enum: ['Error', 'Warning', 'Info'] })
  severity: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  acknowledged: boolean;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(entity: ValidationResult): ValidationResultResponseDto {
    const dto = new ValidationResultResponseDto();
    dto.id = entity.id;
    dto.projectId = entity.projectId;
    dto.entityType = entity.entityType;
    dto.entityId = entity.entityId;
    dto.ruleName = entity.ruleName;
    dto.severity = entity.severity;
    dto.message = entity.message;
    dto.acknowledged = entity.acknowledged;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
