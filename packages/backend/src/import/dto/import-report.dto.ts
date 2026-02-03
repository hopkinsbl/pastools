import { ApiProperty } from '@nestjs/swagger';

export class ImportErrorDetailDto {
  @ApiProperty({
    description: 'Row number in the source file',
    example: 5,
  })
  row: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed: Name is required',
  })
  error: string;

  @ApiProperty({
    description: 'Row data that caused the error',
    example: { 'Tag Name': '', 'Description': 'Test tag' },
  })
  data: Record<string, any>;

  @ApiProperty({
    description: 'Validation results for this row',
    required: false,
  })
  validationResults?: any[];
}

export class ImportWarningDetailDto {
  @ApiProperty({
    description: 'Row number in the source file',
    example: 10,
  })
  row: number;

  @ApiProperty({
    description: 'Warning messages',
    example: ['Naming convention: Tag name should start with uppercase'],
  })
  warnings: string[];

  @ApiProperty({
    description: 'Row data that generated warnings',
    example: { 'Tag Name': 'tag001', 'Description': 'Test tag' },
  })
  data: Record<string, any>;

  @ApiProperty({
    description: 'ID of the created entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  entityId?: string;
}

export class ImportReportDto {
  @ApiProperty({
    description: 'Number of successfully imported rows',
    example: 45,
  })
  success: number;

  @ApiProperty({
    description: 'Number of rows with errors',
    example: 3,
  })
  errors: number;

  @ApiProperty({
    description: 'Number of rows with warnings',
    example: 7,
  })
  warnings: number;

  @ApiProperty({
    description: 'Total number of rows processed',
    example: 55,
  })
  totalRows: number;

  @ApiProperty({
    description: 'Detailed error information for failed rows',
    type: [ImportErrorDetailDto],
  })
  errorDetails: ImportErrorDetailDto[];

  @ApiProperty({
    description: 'Detailed warning information for rows with warnings',
    type: [ImportWarningDetailDto],
  })
  warningDetails: ImportWarningDetailDto[];

  @ApiProperty({
    description: 'Import job ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  jobId: string;

  @ApiProperty({
    description: 'Import job status',
    example: 'Completed',
  })
  status: string;

  @ApiProperty({
    description: 'Source file name',
    example: 'tags_import.xlsx',
  })
  sourceFile: string;

  @ApiProperty({
    description: 'Sheet name (for XLSX files)',
    example: 'Tags',
  })
  sheetName: string;

  @ApiProperty({
    description: 'Entity type imported',
    example: 'tag',
  })
  entityType: string;

  @ApiProperty({
    description: 'Import start timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  startedAt: Date;

  @ApiProperty({
    description: 'Import completion timestamp',
    example: '2024-01-15T10:32:15Z',
  })
  completedAt: Date;
}
