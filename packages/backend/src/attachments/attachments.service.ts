import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../entities/attachment.entity';
import { File } from '../entities/file.entity';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  /**
   * Create an attachment linking a file to an entity
   * @param createAttachmentDto Attachment creation data
   * @param userId User creating the attachment
   * @returns Created attachment
   */
  async create(
    createAttachmentDto: CreateAttachmentDto,
    userId: string,
  ): Promise<Attachment> {
    // Verify file exists
    const file = await this.fileRepository.findOne({
      where: { id: createAttachmentDto.fileId },
    });

    if (!file) {
      throw new NotFoundException(
        `File with ID ${createAttachmentDto.fileId} not found`,
      );
    }

    // Create attachment
    const attachment = this.attachmentRepository.create({
      entityType: createAttachmentDto.entityType,
      entityId: createAttachmentDto.entityId,
      fileId: createAttachmentDto.fileId,
      description: createAttachmentDto.description,
      createdBy: userId,
    });

    return await this.attachmentRepository.save(attachment);
  }

  /**
   * Get all attachments for a specific entity
   * @param entityType Type of entity
   * @param entityId ID of entity
   * @returns Array of attachments
   */
  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<Attachment[]> {
    return await this.attachmentRepository.find({
      where: {
        entityType,
        entityId,
      },
      relations: ['file', 'createdByUser'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Get a specific attachment by ID
   * @param id Attachment ID
   * @returns Attachment
   */
  async findOne(id: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
      relations: ['file', 'createdByUser'],
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  /**
   * Delete an attachment
   * @param id Attachment ID
   */
  async remove(id: string): Promise<void> {
    const attachment = await this.findOne(id);

    // Optional: Add authorization check here
    // For now, any authenticated user can delete attachments
    // In production, you might want to check if user is the creator or has admin role

    await this.attachmentRepository.remove(attachment);
  }

  /**
   * Count attachments for an entity
   * @param entityType Type of entity
   * @param entityId ID of entity
   * @returns Count of attachments
   */
  async countByEntity(entityType: string, entityId: string): Promise<number> {
    return await this.attachmentRepository.count({
      where: {
        entityType,
        entityId,
      },
    });
  }
}
