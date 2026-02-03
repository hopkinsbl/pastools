import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadRequestDto } from './dto/upload-request.dto';
import { UploadResponseDto } from './dto/upload-response.dto';
import { DownloadResponseDto } from './dto/download-response.dto';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Request a presigned URL for file upload
   * POST /storage/upload-url
   */
  @Post('upload-url')
  async requestUploadUrl(
    @Body() uploadRequest: UploadRequestDto,
    @Request() req,
  ): Promise<UploadResponseDto> {
    const userId = req.user.userId;
    return await this.storageService.generateUploadUrl(
      uploadRequest.filename,
      uploadRequest.contentType,
      uploadRequest.size,
      userId,
    );
  }

  /**
   * Get file metadata and download URL
   * GET /storage/files/:id
   */
  @Get('files/:id')
  async getFile(@Param('id') fileId: string): Promise<DownloadResponseDto> {
    const file = await this.storageService.getFileMetadata(fileId);
    const downloadUrl = await this.storageService.generateDownloadUrl(fileId);

    return {
      downloadUrl,
      filename: file.filename,
      contentType: file.contentType,
      size: Number(file.size),
    };
  }

  /**
   * Get file metadata only
   * GET /storage/files/:id/metadata
   */
  @Get('files/:id/metadata')
  async getFileMetadata(@Param('id') fileId: string) {
    return await this.storageService.getFileMetadata(fileId);
  }

  /**
   * Delete a file
   * DELETE /storage/files/:id
   */
  @Delete('files/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('id') fileId: string): Promise<void> {
    await this.storageService.deleteFile(fileId);
  }

  /**
   * List files uploaded by current user
   * GET /storage/my-files
   */
  @Get('my-files')
  async listMyFiles(@Request() req) {
    const userId = req.user.userId;
    return await this.storageService.listUserFiles(userId);
  }
}
