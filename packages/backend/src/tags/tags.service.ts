import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { BaseProjectScopedService } from '../projects/base-project-scoped.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { LinksService } from '../links/links.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { ValidationService } from '../validation/validation.service';
import { plainToInstance } from 'class-transformer';
import { LinkResponseDto } from '../links/dto/link-response.dto';
import { AttachmentResponseDto } from '../attachments/dto/attachment-response.dto';

@Injectable()
export class TagsService extends BaseProjectScopedService<Tag> {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly linksService: LinksService,
    private readonly attachmentsService: AttachmentsService,
    private readonly validationService: ValidationService,
  ) {
    super(tagRepository);
  }

  async create(
    projectId: string,
    createTagDto: CreateTagDto,
    userId: string,
  ): Promise<TagResponseDto> {
    // Validate before creating
    await this.validationService.canSaveEntity(
      projectId,
      'tag',
      createTagDto,
      userId,
    );

    const tag = await this.createInProject(projectId, createTagDto, userId);

    // Store validation results after creation
    await this.validationService.validateAndStoreResults(
      projectId,
      'tag',
      tag.id,
      tag,
      userId,
    );

    return this.toResponseDto(tag);
  }

  async findAll(projectId: string): Promise<TagResponseDto[]> {
    const tags = await this.findAllInProject(projectId);
    return tags.map((tag) => this.toResponseDto(tag));
  }

  async findOne(id: string, projectId: string): Promise<TagResponseDto> {
    const tag = await this.findOneInProject(id, projectId);
    const links = await this.linksService.findByEntity('tag', id);
    const attachments = await this.attachmentsService.findByEntity('tag', id);
    return {
      ...this.toResponseDto(tag),
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
    updateTagDto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    // Get existing tag to merge with update
    const existingTag = await this.findOneInProject(id, projectId);
    const mergedTag = { ...existingTag, ...updateTagDto };

    // Validate before updating
    await this.validationService.canSaveEntity(
      projectId,
      'tag',
      mergedTag,
      existingTag.createdBy,
      id,
    );

    const tag = await this.updateInProject(id, projectId, updateTagDto);

    // Store validation results after update
    await this.validationService.validateAndStoreResults(
      projectId,
      'tag',
      tag.id,
      tag,
      existingTag.createdBy,
    );

    return this.toResponseDto(tag);
  }

  async remove(id: string, projectId: string): Promise<void> {
    // Check for active links before deletion
    const hasLinks = await this.linksService.hasLinks('tag', id);
    if (hasLinks) {
      const linkCount = await this.linksService.countLinks('tag', id);
      throw new Error(
        `Cannot delete tag: ${linkCount} active link(s) exist. Please remove links first or confirm deletion.`,
      );
    }
    await this.deleteInProject(id, projectId);
  }

  private toResponseDto(tag: Tag): TagResponseDto {
    return {
      id: tag.id,
      projectId: tag.projectId,
      type: tag.type,
      name: tag.name,
      description: tag.description,
      engineeringUnits: tag.engineeringUnits,
      scaleLow: tag.scaleLow,
      scaleHigh: tag.scaleHigh,
      metadata: tag.metadata,
      importLineage: tag.importLineage,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      createdBy: tag.createdBy,
    };
  }
}
