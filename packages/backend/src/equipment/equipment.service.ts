import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../entities/equipment.entity';
import { BaseProjectScopedService } from '../projects/base-project-scoped.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentResponseDto } from './dto/equipment-response.dto';
import { LinksService } from '../links/links.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { plainToInstance } from 'class-transformer';
import { LinkResponseDto } from '../links/dto/link-response.dto';
import { AttachmentResponseDto } from '../attachments/dto/attachment-response.dto';

@Injectable()
export class EquipmentService extends BaseProjectScopedService<Equipment> {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    private readonly linksService: LinksService,
    private readonly attachmentsService: AttachmentsService,
  ) {
    super(equipmentRepository);
  }

  async create(
    projectId: string,
    createEquipmentDto: CreateEquipmentDto,
    userId: string,
  ): Promise<EquipmentResponseDto> {
    const equipment = await this.createInProject(
      projectId,
      createEquipmentDto,
      userId,
    );
    return this.toResponseDto(equipment);
  }

  async findAll(projectId: string): Promise<EquipmentResponseDto[]> {
    const equipment = await this.findAllInProject(projectId);
    return equipment.map((item) => this.toResponseDto(item));
  }

  async findOne(
    id: string,
    projectId: string,
  ): Promise<EquipmentResponseDto> {
    const equipment = await this.findOneInProject(id, projectId);
    const links = await this.linksService.findByEntity('equipment', id);
    const attachments = await this.attachmentsService.findByEntity(
      'equipment',
      id,
    );
    return {
      ...this.toResponseDto(equipment),
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
    updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    const equipment = await this.updateInProject(
      id,
      projectId,
      updateEquipmentDto,
    );
    return this.toResponseDto(equipment);
  }

  async remove(id: string, projectId: string): Promise<void> {
    // Check for active links before deletion
    const hasLinks = await this.linksService.hasLinks('equipment', id);
    if (hasLinks) {
      const linkCount = await this.linksService.countLinks('equipment', id);
      throw new Error(
        `Cannot delete equipment: ${linkCount} active link(s) exist. Please remove links first or confirm deletion.`,
      );
    }
    await this.deleteInProject(id, projectId);
  }

  private toResponseDto(equipment: Equipment): EquipmentResponseDto {
    return {
      id: equipment.id,
      projectId: equipment.projectId,
      name: equipment.name,
      description: equipment.description,
      type: equipment.type,
      location: equipment.location,
      metadata: equipment.metadata,
      importLineage: equipment.importLineage,
      createdAt: equipment.createdAt,
      updatedAt: equipment.updatedAt,
      createdBy: equipment.createdBy,
    };
  }
}
