import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class UploadRequestDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsNumber()
  @Min(1)
  @Max(100 * 1024 * 1024) // 100MB
  size: number;
}
