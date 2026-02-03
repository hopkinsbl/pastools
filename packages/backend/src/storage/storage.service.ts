import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { File } from '../entities/file.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private configService: ConfigService,
  ) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY', 'pastools');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY', 'pastools_dev_password');
    this.bucketName = this.configService.get<string>('S3_BUCKET', 'pastools-files');

    this.s3Client = new S3Client({
      endpoint,
      region: 'us-east-1', // MinIO doesn't care about region but SDK requires it
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
    } catch {
      // Bucket doesn't exist, create it
      try {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
      } catch (createError) {
        console.error('Failed to create bucket:', createError);
      }
    }
  }

  /**
   * Generate a presigned URL for file upload
   * @param filename Original filename
   * @param contentType MIME type of the file
   * @param size File size in bytes
   * @param userId User uploading the file
   * @returns Object containing presigned URL and file metadata
   */
  async generateUploadUrl(
    filename: string,
    contentType: string,
    size: number,
    userId: string,
  ): Promise<{ uploadUrl: string; fileId: string; storageKey: string }> {
    // Validate file size
    if (size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Generate unique storage key
    const fileExtension = filename.split('.').pop();
    const storageKey = `${randomUUID()}.${fileExtension}`;

    // Create file metadata record
    const fileRecord = this.fileRepository.create({
      filename,
      contentType,
      size,
      storageKey,
      uploadedBy: userId,
    });

    const savedFile = await this.fileRepository.save(fileRecord);

    // Generate presigned URL for upload (valid for 15 minutes)
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

    return {
      uploadUrl,
      fileId: savedFile.id,
      storageKey,
    };
  }

  /**
   * Upload file directly (for server-side uploads)
   * @param filename Original filename
   * @param contentType MIME type
   * @param buffer File buffer
   * @param userId User uploading the file
   * @returns File entity
   */
  async uploadFile(
    filename: string,
    contentType: string,
    buffer: Buffer,
    userId: string,
  ): Promise<File> {
    const size = buffer.length;

    // Validate file size
    if (size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Generate unique storage key
    const fileExtension = filename.split('.').pop();
    const storageKey = `${randomUUID()}.${fileExtension}`;

    try {
      // Upload to S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: storageKey,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      // Create file metadata record
      const fileRecord = this.fileRepository.create({
        filename,
        contentType,
        size,
        storageKey,
        uploadedBy: userId,
      });

      return await this.fileRepository.save(fileRecord);
    } catch {
      throw new InternalServerErrorException('Failed to upload file to storage');
    }
  }

  /**
   * Generate a presigned URL for file download
   * @param fileId File ID
   * @returns Presigned download URL
   */
  async generateDownloadUrl(fileId: string): Promise<string> {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    // Generate presigned URL for download (valid for 1 hour)
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: file.storageKey,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  /**
   * Get file metadata
   * @param fileId File ID
   * @returns File entity
   */
  async getFileMetadata(fileId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['uploadedByUser'],
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    return file;
  }

  /**
   * Delete a file
   * @param fileId File ID
   */
  async deleteFile(fileId: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id: fileId } });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    try {
      // Delete from S3
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: file.storageKey,
        }),
      );

      // Delete metadata record
      await this.fileRepository.remove(file);
    } catch {
      throw new InternalServerErrorException('Failed to delete file from storage');
    }
  }

  /**
   * List files uploaded by a user
   * @param userId User ID
   * @returns Array of file entities
   */
  async listUserFiles(userId: string): Promise<File[]> {
    return await this.fileRepository.find({
      where: { uploadedBy: userId },
      order: { uploadedAt: 'DESC' },
    });
  }
}
