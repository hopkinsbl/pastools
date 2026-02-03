import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AcknowledgeWarningDto {
  @ApiProperty({ description: 'Validation result ID to acknowledge' })
  @IsUUID()
  validationResultId: string;
}
