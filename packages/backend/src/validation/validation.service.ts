import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationResult } from '../entities/validation-result.entity';
import { ValidationEngine } from './validation.engine';
import { ValidationContext, ValidationSeverity } from './interfaces/validation-rule.interface';

/**
 * Service for managing validation operations
 */
@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  constructor(
    private readonly validationEngine: ValidationEngine,
    @InjectRepository(ValidationResult)
    private readonly validationResultRepository: Repository<ValidationResult>,
  ) {}

  /**
   * Validate an entity and store results
   * @param context Validation context
   * @param userId User ID who triggered the validation
   */
  async validateEntity(context: ValidationContext, userId: string) {
    return this.validationEngine.validateAndStore(context, userId);
  }

  /**
   * Get validation results for an entity
   * @param projectId Project ID
   * @param entityType Entity type
   * @param entityId Entity ID
   */
  async getValidationResults(
    projectId: string,
    entityType: string,
    entityId: string,
  ): Promise<ValidationResult[]> {
    return this.validationResultRepository.find({
      where: {
        projectId,
        entityType,
        entityId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Get all validation results for a project
   * @param projectId Project ID
   * @param entityType Optional entity type filter
   */
  async getProjectValidationResults(
    projectId: string,
    entityType?: string,
  ): Promise<ValidationResult[]> {
    const where: any = { projectId };
    if (entityType) {
      where.entityType = entityType;
    }

    return this.validationResultRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Acknowledge a validation warning
   * @param validationResultId Validation result ID
   */
  async acknowledgeWarning(
    validationResultId: string,
  ): Promise<ValidationResult> {
    const result = await this.validationResultRepository.findOne({
      where: { id: validationResultId },
    });

    if (!result) {
      throw new Error('Validation result not found');
    }

    if (result.severity === 'Error') {
      throw new Error('Cannot acknowledge errors, only warnings');
    }

    result.acknowledged = true;
    return this.validationResultRepository.save(result);
  }

  /**
   * Clear validation results for an entity
   * @param projectId Project ID
   * @param entityType Entity type
   * @param entityId Entity ID
   */
  async clearValidationResults(
    projectId: string,
    entityType: string,
    entityId: string,
  ): Promise<void> {
    await this.validationEngine.clearValidationResults(
      projectId,
      entityType,
      entityId,
    );
  }

  /**
   * Get validation summary for a project
   * @param projectId Project ID
   */
  async getValidationSummary(projectId: string) {
    const results = await this.getProjectValidationResults(projectId);

    const summary = {
      total: results.length,
      errors: results.filter((r) => r.severity === 'Error').length,
      warnings: results.filter((r) => r.severity === 'Warning').length,
      info: results.filter((r) => r.severity === 'Info').length,
      acknowledged: results.filter((r) => r.acknowledged).length,
      byEntityType: {} as Record<string, number>,
      byRule: {} as Record<string, number>,
    };

    // Count by entity type
    results.forEach((r) => {
      summary.byEntityType[r.entityType] =
        (summary.byEntityType[r.entityType] || 0) + 1;
    });

    // Count by rule
    results.forEach((r) => {
      summary.byRule[r.ruleName] = (summary.byRule[r.ruleName] || 0) + 1;
    });

    return summary;
  }

  /**
   * Check if an entity can be saved based on validation results
   * @param projectId Project ID
   * @param entityType Entity type
   * @param entity Entity data to validate
   * @param userId User ID
   * @param entityId Entity ID (if updating existing entity)
   * @param allowOverride Whether to allow override of validation errors
   * @returns True if entity can be saved, throws error otherwise
   */
  async canSaveEntity(
    projectId: string,
    entityType: string,
    entity: any,
    userId: string,
    entityId?: string,
    allowOverride: boolean = false,
  ): Promise<boolean> {
    // Run validation
    const results = await this.validationEngine.validateEntity({
      projectId,
      entityType,
      entityId,
      entity,
    });

    // Check for errors
    const hasErrors = this.validationEngine.hasErrors(results);

    if (hasErrors && !allowOverride) {
      const errorMessages = results
        .filter((r) => !r.passed && r.severity === ValidationSeverity.ERROR)
        .map((r) => `${r.ruleName}: ${r.message}`)
        .join('; ');

      throw new Error(
        `Cannot save entity due to validation errors: ${errorMessages}`,
      );
    }

    return true;
  }

  /**
   * Validate and store results for an entity
   * This should be called after entity creation/update
   * @param projectId Project ID
   * @param entityType Entity type
   * @param entityId Entity ID
   * @param entity Entity data
   * @param userId User ID
   */
  async validateAndStoreResults(
    projectId: string,
    entityType: string,
    entityId: string,
    entity: any,
    userId: string,
  ): Promise<void> {
    const results = await this.validationEngine.validateEntity({
      projectId,
      entityType,
      entityId,
      entity,
    });

    // Clear old results and store new ones
    await this.validationEngine.clearValidationResults(
      projectId,
      entityType,
      entityId,
    );

    await this.validationEngine.storeValidationResults(
      projectId,
      entityType,
      entityId,
      results,
    );
  }
}
