import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';
import { ImportProfile } from '../entities/import-profile.entity';
import { Job, JobType, JobStatus } from '../entities/job.entity';
import { FileInfoDto, SheetInfoDto } from './dto/file-info.dto';
import { CreateImportProfileDto } from './dto/import-profile.dto';
import { StartImportDto } from './dto/start-import.dto';
import { ImportReportDto } from './dto/import-report.dto';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(ImportProfile)
    private readonly importProfileRepository: Repository<ImportProfile>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectQueue('import')
    private readonly importQueue: Queue,
  ) {}

  /**
   * Parse a CSV file and extract headers and row count
   */
  async parseCSV(filePath: string): Promise<FileInfoDto> {
    return new Promise((resolve, reject) => {
      const headers: string[] = [];
      let rowCount = 0;
      let headersExtracted = false;

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('headers', (headerList: string[]) => {
          headers.push(...headerList);
          headersExtracted = true;
        })
        .on('data', () => {
          rowCount++;
        })
        .on('end', () => {
          if (!headersExtracted || headers.length === 0) {
            reject(
              new BadRequestException(
                'CSV file has no headers or is empty',
              ),
            );
            return;
          }

          resolve({
            fileType: 'csv',
            sheets: [
              {
                name: 'Sheet1',
                headers,
                rowCount,
              },
            ],
          });
        })
        .on('error', (error) => {
          reject(
            new BadRequestException(
              `Failed to parse CSV file: ${error.message}`,
            ),
          );
        });
    });
  }

  /**
   * Parse an XLSX file and extract sheet names, headers, and row counts
   */
  async parseXLSX(filePath: string): Promise<FileInfoDto> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheets: SheetInfoDto[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON to get headers and row count
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          // Empty sheet, skip it
          continue;
        }

        // First row contains headers
        const headers = (jsonData[0] as any[]).map((h) =>
          h ? String(h) : '',
        );
        
        // Row count excludes header row
        const rowCount = jsonData.length - 1;

        sheets.push({
          name: sheetName,
          headers,
          rowCount,
        });
      }

      if (sheets.length === 0) {
        throw new BadRequestException(
          'XLSX file has no sheets with data',
        );
      }

      return {
        fileType: 'xlsx',
        sheets,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to parse XLSX file: ${error.message}`,
      );
    }
  }

  /**
   * Parse a file (CSV or XLSX) and return file information
   */
  async parseFile(
    filePath: string,
    fileType: 'csv' | 'xlsx',
  ): Promise<FileInfoDto> {
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    if (fileType === 'csv') {
      return this.parseCSV(filePath);
    } else if (fileType === 'xlsx') {
      return this.parseXLSX(filePath);
    } else {
      throw new BadRequestException(
        'Unsupported file type. Only CSV and XLSX are supported.',
      );
    }
  }

  /**
   * Create a new import profile
   */
  async createProfile(
    dto: CreateImportProfileDto,
    userId: string,
  ): Promise<ImportProfile> {
    const profile = this.importProfileRepository.create({
      ...dto,
      createdBy: userId,
    });

    return this.importProfileRepository.save(profile);
  }

  /**
   * Get all import profiles
   */
  async getProfiles(): Promise<ImportProfile[]> {
    return this.importProfileRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get import profiles by entity type
   */
  async getProfilesByEntityType(
    entityType: string,
  ): Promise<ImportProfile[]> {
    return this.importProfileRepository.find({
      where: { entityType },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single import profile by ID
   */
  async getProfile(id: string): Promise<ImportProfile> {
    const profile = await this.importProfileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new BadRequestException('Import profile not found');
    }

    return profile;
  }

  /**
   * Delete an import profile
   */
  async deleteProfile(id: string): Promise<void> {
    const result = await this.importProfileRepository.delete(id);

    if (result.affected === 0) {
      throw new BadRequestException('Import profile not found');
    }
  }

  /**
   * Start an import job
   */
  async startImport(
    projectId: string,
    dto: StartImportDto,
    userId: string,
  ): Promise<Job> {
    // Verify file exists
    if (!fs.existsSync(dto.filePath)) {
      throw new BadRequestException('File not found');
    }

    // Create job record
    const job = this.jobRepository.create({
      type: JobType.IMPORT,
      projectId,
      status: JobStatus.QUEUED,
      progress: 0,
      createdBy: userId,
    });

    const savedJob = await this.jobRepository.save(job);

    // Add job to queue
    await this.importQueue.add('import', {
      jobId: savedJob.id,
      projectId,
      filePath: dto.filePath,
      fileType: dto.fileType,
      sheetName: dto.sheetName,
      entityType: dto.entityType,
      columnMappings: dto.columnMappings,
      userId,
    });

    return savedJob;
  }

  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new BadRequestException('Job not found');
    }

    return job;
  }

  /**
   * Get all jobs for a project
   */
  async getProjectJobs(projectId: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { projectId, type: JobType.IMPORT },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Generate a formatted import report from a job
   */
  async getImportReport(jobId: string): Promise<ImportReportDto> {
    const job = await this.getJob(jobId);

    if (job.type !== JobType.IMPORT) {
      throw new BadRequestException('Job is not an import job');
    }

    if (job.status !== JobStatus.COMPLETED && job.status !== JobStatus.FAILED) {
      throw new BadRequestException('Import job is not yet complete');
    }

    // Extract report data from job result
    const result = job.result || {};
    const success = result.success || 0;
    const errors = result.errors || 0;
    const warnings = result.warnings || 0;
    const errorDetails = result.errorDetails || [];
    const warningDetails = result.warningDetails || [];

    // Calculate total rows
    const totalRows = success + errors;

    // Extract metadata from job result or use defaults
    const sourceFile = result.sourceFile || 'unknown';
    const sheetName = result.sheetName || 'Sheet1';
    const entityType = result.entityType || 'unknown';

    return {
      jobId: job.id,
      status: job.status,
      success,
      errors,
      warnings,
      totalRows,
      errorDetails,
      warningDetails,
      sourceFile,
      sheetName,
      entityType,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };
  }
}
