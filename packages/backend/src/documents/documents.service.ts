import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { BaseProjectScopedService } from '../projects/base-project-scoped.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { LinksService } from '../links/links.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { plainToInstance } from 'class-transformer';
import { LinkResponseDto } from '../links/dto/link-response.dto';
import { AttachmentResponseDto } from '../attachments/dto/attachment-response.dto';

@Injectable()
export class DocumentsService extends BaseProjectScopedService<Document> {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly linksService: LinksService,
    private readonly attachmentsService: AttachmentsService,
  ) {
    super(documentRepository);
  }

  async create(
    projectId: string,
    createDocumentDto: CreateDocumentDto,
    userId: string,
  ): Promise<DocumentResponseDto> {
    const document = await this.createInProject(
      projectId,
      createDocumentDto,
      userId,
    );
    return this.toResponseDto(document);
  }

  async findAll(projectId: string): Promise<DocumentResponseDto[]> {
    const documents = await this.findAllInProject(projectId);
    return documents.map((doc) => this.toResponseDto(doc));
  }

  async findOne(
    id: string,
    projectId: string,
  ): Promise<DocumentResponseDto> {
    const document = await this.findOneInProject(id, projectId);
    const links = await this.linksService.findByEntity('document', id);
    const attachments = await this.attachmentsService.findByEntity(
      'document',
      id,
    );
    return {
      ...this.toResponseDto(document),
      links: plainToInstance(LinkResponseDto, links, {
        excludeExtraneousValues: true,
      }),
      attachments: plainToInstance(AttachmentResponseDto, attachments, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async update(
    id: string,
    projectId: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    const document = await this.updateInProject(
      id,
      projectId,
      updateDocumentDto,
    );
    return this.toResponseDto(document);
  }

  async remove(id: string, projectId: string): Promise<void> {
    // Check for active links before deletion
    const hasLinks = await this.linksService.hasLinks('document', id);
    if (hasLinks) {
      const linkCount = await this.linksService.countLinks('document', id);
      throw new Error(
        `Cannot delete document: ${linkCount} active link(s) exist. Please remove links first or confirm deletion.`,
      );
    }
    await this.deleteInProject(id, projectId);
  }

  private toResponseDto(document: Document): DocumentResponseDto {
    return {
      id: document.id,
      projectId: document.projectId,
      title: document.title,
      type: document.type,
      version: document.version,
      fileId: document.fileId,
      metadata: document.metadata,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      createdBy: document.createdBy,
    };
  }
}
