import { IsString, IsEnum, IsOptional, IsNumber, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlarmPriority } from '../../entities/alarm.entity';

export class CreateAlarmDto {
  @ApiProperty({
    description: 'Tag ID that this alarm is associated with',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  tagId: string;

  @ApiProperty({
    description: 'Alarm priority',
    enum: AlarmPriority,
    example: AlarmPriority.HIGH,
  })
  @IsEnum(AlarmPriority)
  priority: AlarmPriority;

  @ApiPropertyOptional({
    description: 'Alarm setpoint value',
    example: 85.5,
  })
  @IsNumber()
  @IsOptional()
  setpoint?: number;

  @ApiPropertyOptional({
    description: 'Alarm rationalization',
    example: 'High temperature alarm to prevent equipment damage',
  })
  @IsString()
  @IsOptional()
  rationalization?: string;

  @ApiPropertyOptional({
    description: 'Consequence if alarm is not addressed',
    example: 'Equipment overheating and potential failure',
  })
  @IsString()
  @IsOptional()
  consequence?: string;

  @ApiPropertyOptional({
    description: 'Required operator action',
    example: 'Reduce feed rate and check cooling system',
  })
  @IsString()
  @IsOptional()
  operatorAction?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { alarmType: 'High', deadband: 2.0 },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Import lineage information',
    example: {
      sourceFile: 'alarms_export.xlsx',
      sheetName: 'Temperature Alarms',
      rowNumber: 23,
    },
  })
  @IsObject()
  @IsOptional()
  importLineage?: {
    sourceFile?: string;
    sheetName?: string;
    rowNumber?: number;
  };
}
