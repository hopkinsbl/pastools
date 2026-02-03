import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job as BullJob } from 'bullmq';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';
import { Job, JobStatus } from '../entities/job.entity';
import { Tag } from '../entities/tag.entity';
import { Equipment } from '../entities/equipment.entity';
import { Alarm } from '../entities/alarm.entity';
import { Document } from '../entities/document.entity';
import { ValidationEngine } from '../validation/validation.engine';
import { ValidationSeverity } from '../validation/interfaces/validation-rule.interface';

interface ImportJobData {
  jobId: string;
  projectId: string;
  filePath: string;
  fileType: 'csv' | 'xlsx';
  sheetName: string;
  entityType: string;
  columnMappings: Record<string, string>;
  userId: string;
}

@Processor('import')
export class ImportProcessor extends WorkerHost {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(Alarm)
    private readonly alarmRepository: Repository<Alarm>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly validationEngine: ValidationEngine,
  ) {
    super();
  }

  async process(job: BullJob<ImportJobData>): Promise<any> {
    const { jobId, projectId, filePath, fileType, sheetName, entityType, columnMappings, userId } =
      job.data;

    this.logger.log(`Starting import job ${jobId} for project ${projectId}`);

    try {
      // Update job status to running
      await this.updateJobStatus(jobId, JobStatus.RUNNING, 0);

      // Parse file and extract rows
      const rows = await this.parseFileRows(filePath, fileType, sheetName);
      const totalRows = rows.length;

      this.logger.log(`Parsed ${totalRows} rows from file`);

      // Process each row
      const results = {
        success: 0,
        errors: 0,
        warnings: 0,
        errorDetails: [] as any[],
        warningDetails: [] as any[],
        sourceFile: filePath.split('/').pop() || filePath,
        sheetName,
        entityType,
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because row 1 is header and array is 0-indexed

        try {
          // Map row data to entity fields
          const entityData = this.mapRowToEntity(row, columnMappings);

          // Add project context and import lineage
          const entityWithMetadata = {
            ...entityData,
            projectId,
            createdBy: userId,
            importLineage: {
              sourceFile: filePath.split('/').pop() || filePath,
              sheetName,
              rowNumber,
            },
          };

          // Validate entity before creating
          const validationResults = await this.validationEngine.validateEntity({
            projectId,
            entityType,
            entity: entityWithMetadata,
          });

          // Check for validation errors
          const hasErrors = this.validationEngine.hasErrors(validationResults);
          const hasWarnings = this.validationEngine.hasWarnings(validationResults);

          if (hasErrors) {
            // Reject row with validation errors
            results.errors++;
            const errorMessages = validationResults
              .filter((r) => !r.passed && r.severity === ValidationSeverity.ERROR)
              .map((r) => `${r.ruleName}: ${r.message}`);

            results.errorDetails.push({
              row: rowNumber,
              error: `Validation failed: ${errorMessages.join('; ')}`,
              data: row,
              validationResults: validationResults.filter(
                (r) => !r.passed && r.severity === ValidationSeverity.ERROR,
              ),
            });

            this.logger.warn(
              `Row ${rowNumber} rejected due to validation errors: ${errorMessages.join('; ')}`,
            );
            continue; // Skip this row
          }

          // Create entity
          const createdEntity = await this.createEntity(entityType, entityWithMetadata);

          // Store validation results if entity was created
          if (createdEntity && validationResults.length > 0) {
            await this.validationEngine.storeValidationResults(
              projectId,
              entityType,
              createdEntity.id,
              validationResults,
            );
          }

          // Track warnings
          if (hasWarnings) {
            results.warnings++;
            const warningMessages = validationResults
              .filter((r) => !r.passed && r.severity === ValidationSeverity.WARNING)
              .map((r) => `${r.ruleName}: ${r.message}`);

            results.warningDetails.push({
              row: rowNumber,
              warnings: warningMessages,
              data: row,
              entityId: createdEntity?.id,
            });

            this.logger.debug(
              `Row ${rowNumber} imported with warnings: ${warningMessages.join('; ')}`,
            );
          }

          results.success++;
        } catch (error: any) {
          results.errors++;
          results.errorDetails.push({
            row: rowNumber,
            error: error.message,
            data: row,
          });
          this.logger.error(`Error processing row ${rowNumber}: ${error.message}`);
        }

        // Update progress
        const progress = Math.round(((i + 1) / totalRows) * 100);
        await this.updateJobStatus(jobId, JobStatus.RUNNING, progress);
        await job.updateProgress(progress);
      }

      // Update job status to completed
      await this.updateJobStatus(jobId, JobStatus.COMPLETED, 100, results);

      this.logger.log(
        `Import job ${jobId} completed: ${results.success} success, ${results.errors} errors`
      );

      return results;
    } catch (error: any) {
      this.logger.error(`Import job ${jobId} failed: ${error.message}`);
      await this.updateJobStatus(jobId, JobStatus.FAILED, 0, null, error.message);
      throw error;
    }
  }

  private async parseFileRows(
    filePath: string,
    fileType: 'csv' | 'xlsx',
    sheetName: string
  ): Promise<any[]> {
    if (fileType === 'csv') {
      return this.parseCSVRows(filePath);
    } else {
      return this.parseXLSXRows(filePath, sheetName);
    }
  }

  private async parseCSVRows(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve(rows);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private parseXLSXRows(filePath: string, sheetName: string): any[] {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in file`);
    }

    // Convert sheet to JSON with header row
    const rows = XLSX.utils.sheet_to_json(worksheet);
    return rows;
  }

  private mapRowToEntity(
    row: any,
    columnMappings: Record<string, string>
  ): any {
    const entityData: any = {};

    for (const [fileColumn, entityField] of Object.entries(columnMappings)) {
      if (row[fileColumn] !== undefined && row[fileColumn] !== null) {
        entityData[entityField] = row[fileColumn];
      }
    }

    return entityData;
  }

  private async createEntity(entityType: string, data: any): Promise<any> {
    switch (entityType) {
      case 'tag':
        const tag = this.tagRepository.create(data);
        return await this.tagRepository.save(tag);

      case 'equipment':
        const equipment = this.equipmentRepository.create(data);
        return await this.equipmentRepository.save(equipment);

      case 'alarm':
        const alarm = this.alarmRepository.create(data);
        return await this.alarmRepository.save(alarm);

      case 'document':
        const document = this.documentRepository.create(data);
        return await this.documentRepository.save(document);

      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  private async updateJobStatus(
    jobId: string,
    status: JobStatus,
    progress: number,
    result?: any,
    error?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      progress,
    };

    if (status === JobStatus.RUNNING && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      updateData.completedAt = new Date();
    }

    if (result) {
      updateData.result = result;
    }

    if (error) {
      updateData.error = error;
    }

    await this.jobRepository.update(jobId, updateData);
  }
}
