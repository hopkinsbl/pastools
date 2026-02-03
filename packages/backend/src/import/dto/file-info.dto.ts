import { ApiProperty } from '@nestjs/swagger';

export class SheetInfoDto {
  @ApiProperty({
    description: 'Sheet name',
    example: 'Tags',
  })
  name: string;

  @ApiProperty({
    description: 'Column headers in the sheet',
    example: ['Tag Name', 'Description', 'Type', 'Units'],
  })
  headers: string[];

  @ApiProperty({
    description: 'Number of rows in the sheet (excluding header)',
    example: 150,
  })
  rowCount: number;
}

export class FileInfoDto {
  @ApiProperty({
    description: 'File type',
    example: 'xlsx',
  })
  fileType: string;

  @ApiProperty({
    description: 'Sheets in the file (for XLSX) or single sheet for CSV',
    type: [SheetInfoDto],
  })
  sheets: SheetInfoDto[];
}
