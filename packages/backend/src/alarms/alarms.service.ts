import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alarm } from '../entities/alarm.entity';
import { BaseProjectScopedService } from '../projects/base-project-scoped.service';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { UpdateAlarmDto } from './dto/update-alarm.dto';
import { AlarmResponseDto } from './dto/alarm-response.dto';
import { LinksService } from '../links/links.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { plainToInstance } from 'class-transformer';
import { LinkResponseDto } from '../links/dto/link-response.dto';
import { AttachmentResponseDto } from '../attachments/dto/attachment-response.dto';

@Injectable()
export class AlarmsService extends BaseProjectScopedService<Alarm> {
  constructor(
    @InjectRepository(Alarm)
    private readonly alarmRepository: Repository<Alarm>,
    private readonly linksService: LinksService,
    private readonly attachmentsService: AttachmentsService,
  ) {
    super(alarmRepository);
  }

  async create(
    projectId: string,
    createAlarmDto: CreateAlarmDto,
    userId: string,
  ): Promise<AlarmResponseDto> {
    const alarm = await this.createInProject(projectId, createAlarmDto, userId);
    return this.toResponseDto(alarm);
  }

  async findAll(projectId: string): Promise<AlarmResponseDto[]> {
    const alarms = await this.findAllInProject(projectId);
    return alarms.map((alarm) => this.toResponseDto(alarm));
  }

  async findOne(id: string, projectId: string): Promise<AlarmResponseDto> {
    const alarm = await this.findOneInProject(id, projectId);
    const links = await this.linksService.findByEntity('alarm', id);
    const attachments = await this.attachmentsService.findByEntity('alarm', id);
    return {
      ...this.toResponseDto(alarm),
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
    updateAlarmDto: UpdateAlarmDto,
  ): Promise<AlarmResponseDto> {
    const alarm = await this.updateInProject(id, projectId, updateAlarmDto);
    return this.toResponseDto(alarm);
  }

  async remove(id: string, projectId: string): Promise<void> {
    // Check for active links before deletion
    const hasLinks = await this.linksService.hasLinks('alarm', id);
    if (hasLinks) {
      const linkCount = await this.linksService.countLinks('alarm', id);
      throw new Error(
        `Cannot delete alarm: ${linkCount} active link(s) exist. Please remove links first or confirm deletion.`,
      );
    }
    await this.deleteInProject(id, projectId);
  }

  private toResponseDto(alarm: Alarm): AlarmResponseDto {
    return {
      id: alarm.id,
      projectId: alarm.projectId,
      tagId: alarm.tagId,
      priority: alarm.priority,
      setpoint: alarm.setpoint,
      rationalization: alarm.rationalization,
      consequence: alarm.consequence,
      operatorAction: alarm.operatorAction,
      metadata: alarm.metadata,
      importLineage: alarm.importLineage,
      createdAt: alarm.createdAt,
      updatedAt: alarm.updatedAt,
      createdBy: alarm.createdBy,
    };
  }
}
