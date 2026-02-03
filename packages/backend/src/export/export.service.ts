import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Job, JobType, JobStatus } from '../entities/job.entity';
import { Tag } from '../entities/tag.entity';
import { Equipment } from '../entities/equipment.entity';
import { Alarm } from '../entities/alarm.entity';
import { Document } from '../entities/document.entity';
import { TechnicalQuery } from '../entities/technical-query.entity';
import { PunchlistItem } from '../entities/punchlist-item.entity';
import { StartExportDto, ExportEntityType } from './dto/start-export.dto';
import { createObjectCsvWriter } from 'csv-writer';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Alarm)
    private alarmRepository: Repository<Alarm>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(TechnicalQuery)
    private tqRepository: Repository<TechnicalQuery>,
    @InjectRepository(PunchlistItem)
    private punchlistRepository: Repository<PunchlistItem>,
    @InjectQueue('export')
    private exportQueue: Queue,
  ) {}

  async startExport(
    projectId: string,
    userId: string,
    exportDto: StartExportDto,
  ): Promise<Job> {
    // Create job record
    const job = this.jobRepository.create({
      type: JobType.EXPORT,
      projectId,
      createdBy: userId,
      status: JobStatus.QUEUED,
      progress: 0,
    });

    const savedJob = await this.jobRepository.save(job);

    // Queue the export job
    await this.exportQueue.add('process-export', {
      jobId: savedJob.id,
      projectId,
      exportDto,
    });

    return savedJob;
  }

  async getJobStatus(jobId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }
    return job;
  }

  async processExport(
    jobId: string,
    projectId: string,
    exportDto: StartExportDto,
  ): Promise<void> {
    try {
      // Update job status to running
      await this.jobRepository.update(jobId, {
        status: JobStatus.RUNNING,
        startedAt: new Date(),
        progress: 10,
      } as any);

      // Fetch data based on entity type
      const data = await this.fetchData(projectId, exportDto);

      // Update progress
      await this.jobRepository.update(jobId, { progress: 50 } as any);

      // Generate export file
      const filePath = await this.generateExportFile(data, exportDto);

      // Update progress
      await this.jobRepository.update(jobId, { progress: 90 } as any);

      // Complete job with download link
      await this.jobRepository.update(jobId, {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
        progress: 100,
        result: {
          filePath,
          fileName: path.basename(filePath),
          recordCount: data.length,
        },
      } as any);
    } catch (error) {
      // Mark job as failed
      await this.jobRepository.update(jobId, {
        status: JobStatus.FAILED,
        completedAt: new Date(),
        error: error.message,
      } as any);
      throw error;
    }
  }

  private async fetchData(
    projectId: string,
    exportDto: StartExportDto,
  ): Promise<any[]> {
    let query: any;

    switch (exportDto.entityType) {
      case ExportEntityType.TAG:
        query = this.tagRepository
          .createQueryBuilder('tag')
          .where('tag.projectId = :projectId', { projectId });
        break;

      case ExportEntityType.EQUIPMENT:
        query = this.equipmentRepository
          .createQueryBuilder('equipment')
          .where('equipment.projectId = :projectId', { projectId });
        break;

      case ExportEntityType.ALARM:
        query = this.alarmRepository
          .createQueryBuilder('alarm')
          .leftJoinAndSelect('alarm.tag', 'tag')
          .where('alarm.projectId = :projectId', { projectId });
        break;

      case ExportEntityType.DOCUMENT:
        query = this.documentRepository
          .createQueryBuilder('document')
          .where('document.projectId = :projectId', { projectId });
        break;

      case ExportEntityType.TECHNICAL_QUERY:
        query = this.tqRepository
          .createQueryBuilder('tq')
          .where('tq.projectId = :projectId', { projectId });
        break;

      case ExportEntityType.PUNCHLIST:
        query = this.punchlistRepository
          .createQueryBuilder('punchlist')
          .where('punchlist.projectId = :projectId', { projectId });
        break;

      default:
        throw new Error(`Unsupported entity type: ${exportDto.entityType}`);
    }

    // Apply filters if provided
    if (exportDto.filters) {
      Object.entries(exportDto.filters).forEach(([key, value]) => {
        query.andWhere(`${exportDto.entityType}.${key} = :${key}`, {
          [key]: value,
        });
      });
    }

    const entities = await query.getMany();

    // Transform entities to include only selected columns
    return entities.map((entity) => {
      const row: any = {};
      exportDto.columns.forEach((column) => {
        // Handle nested properties (e.g., tag.name for alarms)
        if (column.includes('.')) {
          const [parent, child] = column.split('.');
          row[column] = entity[parent]?.[child];
        } else {
          row[column] = entity[column];
        }
      });
      return row;
    });
  }

  private async generateExportFile(
    data: any[],
    exportDto: StartExportDto,
  ): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${exportDto.entityType}_export_${timestamp}.${exportDto.format}`;
    const exportDir = path.join(process.cwd(), 'exports');

    // Ensure export directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, fileName);

    if (exportDto.format === 'csv') {
      await this.generateCSV(data, exportDto.columns, filePath);
    } else if (exportDto.format === 'xlsx') {
      await this.generateXLSX(data, exportDto.columns, filePath);
    }

    return filePath;
  }

  private async generateCSV(
    data: any[],
    columns: string[],
    filePath: string,
  ): Promise<void> {
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: columns.map((col) => ({ id: col, title: col })),
    });

    await csvWriter.writeRecords(data);
  }

  private async generateXLSX(
    data: any[],
    columns: string[],
    filePath: string,
  ): Promise<void> {
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data, { header: columns });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');

    // Write to file
    XLSX.writeFile(workbook, filePath);
  }

  async getExportFile(jobId: string): Promise<{ filePath: string; fileName: string }> {
    const job = await this.getJobStatus(jobId);

    if (job.status !== JobStatus.COMPLETED) {
      throw new Error('Export job is not completed');
    }

    if (!job.result?.filePath) {
      throw new Error('Export file not found');
    }

    return {
      filePath: job.result.filePath,
      fileName: job.result.fileName,
    };
  }
}
