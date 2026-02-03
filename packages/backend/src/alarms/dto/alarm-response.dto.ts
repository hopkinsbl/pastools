import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlarmPriority } from '../../entities/alarm.entity';
import { LinkResponseDto } from '../../links/dto/link-response.dto';
import { AttachmentResponseDto } from '../../attachments/dto/attachment-response.dto';

export class AlarmResponseDto {
  @ApiProperty({
    description: 'Alarm ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  projectId: string;

  @ApiProperty({
    description: 'Tag ID that this alarm is associated with',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  tagId: string;

  @ApiProperty({
    description: 'Alarm priority',
    enum: AlarmPriority,
    example: AlarmPriority.HIGH,
  })
  priority: AlarmPriority;

  @ApiPropertyOptional({
    description: 'Alarm setpoint value',
    example: 85.5,
  })
  setpoint?: number;

  @ApiPropertyOptional({
    description: 'Alarm rationalization',
    example: 'High temperature alarm to prevent equipment damage',
  })
  rationalization?: string;

  @ApiPropertyOptional({
    description: 'Consequence if alarm is not addressed',
    example: 'Equipment overheating and potential failure',
  })
  consequence?: string;

  @ApiPropertyOptional({
    description: 'Required operator action',
    example: 'Reduce feed rate and check cooling system',
  })
  operatorAction?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { alarmType: 'High', deadband: 2.0 },
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Import lineage information',
    example: {
      sourceFile: 'alarms_export.xlsx',
      sheetName: 'Temperature Alarms',
      rowNumber: 23,
    },
  })
  importLineage?: {
    sourceFile?: string;
    sheetName?: string;
    rowNumber?: number;
  };

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T14:20:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User ID who created the alarm',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'Links to other entities',
    type: [LinkResponseDto],
  })
  links?: LinkResponseDto[];

  @ApiPropertyOptional({
    description: 'File attachments',
    type: [AttachmentResponseDto],
  })
  attachments?: AttachmentResponseDto[];
}
