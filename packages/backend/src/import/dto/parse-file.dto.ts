import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ParseFileDto {
  @ApiProperty({
    description: 'File path or buffer to parse',
    example: '/tmp/upload/tags.xlsx',
  })
  @IsNotEmpty()
  @IsString()
  filePath: string;

  @ApiProperty({
    description: 'File type (csv or xlsx)',
    example: 'xlsx',
    enum: ['csv', 'xlsx'],
  })
  @IsNotEmpty()
  @IsString()
  fileType: 'csv' | 'xlsx';
}
