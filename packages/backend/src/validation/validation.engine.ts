import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationResult } from '../entities/validation-result.entity';
import {
  ValidationContext,
  ValidationRuleResult,
  ValidationSeverity,
} from './interfaces/validation-rule.interface';
import { ValidationRuleRegistry } from './validation-rule.registry';

/**
 * Engine for executing validation rules against entities
 */
@Injectable()
export class ValidationEngine {
  private readonly logger = new Logger(ValidationEngine.name);

  constructor(
    private readonly ruleRegistry: ValidationRuleRegistry,
    @InjectRepository(ValidationResult)
    private readonly validationResultRepository: Repository<ValidationResult>,
  ) {}

  /**
   * Execute all applicable validation rules for an entity
   * @param context Validation context
   * @returns Array of validation results
   */
  async validateEntity(
    context: ValidationContext,
  ): Promise<ValidationRuleResult[]> {
    const rules = this.ruleRegistry.getRulesForEntityType(context.entityType);

    if (rules.length === 0) {
      this.logger.debug(
        `No validation rules found for entity type: ${context.entityType}`,
      );
      return [];
    }

    this.logger.debug(
      `Executing ${rules.length} validation rules for entity type: ${context.entityType}`,
    );

    const results: ValidationRuleResult[] = [];

    for (const rule of rules) {
      try {
        const ruleResults = await rule.validate(context);
        results.push(...ruleResults);
      } catch (error) {
        this.logger.error(
          `Error executing validation rule "${rule.name}": ${error.message}`,
          error.stack,
        );
        // Add an error result for the failed rule execution
        results.push({
          ruleName: rule.name,
          severity: ValidationSeverity.ERROR,
          message: `Validation rule execution failed: ${error.message}`,
          passed: false,
        });
      }
    }

    return results;
  }

  /**
   * Execute specific validation rules by name
   * @param context Validation context
   * @param ruleNames Array of rule names to execute
   * @returns Array of validation results
   */
  async validateWithRules(
    context: ValidationContext,
    ruleNames: string[],
  ): Promise<ValidationRuleResult[]> {
    const results: ValidationRuleResult[] = [];

    for (const ruleName of ruleNames) {
      const rule = this.ruleRegistry.getRule(ruleName);
      if (!rule) {
        this.logger.warn(`Validation rule not found: ${ruleName}`);
        continue;
      }

      // Check if rule applies to this entity type
      if (
        rule.applicableEntityTypes.length > 0 &&
        !rule.applicableEntityTypes.includes(context.entityType)
      ) {
        this.logger.debug(
          `Skipping rule "${ruleName}" - not applicable to entity type: ${context.entityType}`,
        );
        continue;
      }

      try {
        const ruleResults = await rule.validate(context);
        results.push(...ruleResults);
      } catch (error) {
        this.logger.error(
          `Error executing validation rule "${ruleName}": ${error.message}`,
          error.stack,
        );
        results.push({
          ruleName,
          severity: ValidationSeverity.ERROR,
          message: `Validation rule execution failed: ${error.message}`,
          passed: false,
        });
      }
    }

    return results;
  }

  /**
   * Store validation results in the database
   * @param projectId Project ID
   * @param entityType Entity type
   * @param entityId Entity ID
   * @param results Validation results to store
   * @param userId User ID who triggered the validation
   */
  async storeValidationResults(
    projectId: string,
    entityType: string,
    entityId: string,
    results: ValidationRuleResult[],
  ): Promise<ValidationResult[]> {
    // Only store failed validations (errors and warnings)
    const failedResults = results.filter((r) => !r.passed);

    if (failedResults.length === 0) {
      this.logger.debug(
        `No validation failures to store for entity ${entityId}`,
      );
      return [];
    }

    const entities = failedResults.map((result) => {
      const entity = this.validationResultRepository.create({
        projectId,
        entityType,
        entityId,
        ruleName: result.ruleName,
        severity: result.severity,
        message: result.message,
        acknowledged: false,
      });
      return entity;
    });

    const saved = await this.validationResultRepository.save(entities);
    this.logger.log(
      `Stored ${saved.length} validation results for entity ${entityId}`,
    );

    return saved;
  }

  /**
   * Clear existing validation results for an entity before storing new ones
   * @param projectId Project ID
   * @param entityType Entity type
   * @param entityId Entity ID
   */
  async clearValidationResults(
    projectId: string,
    entityType: string,
    entityId: string,
  ): Promise<void> {
    await this.validationResultRepository.delete({
      projectId,
      entityType,
      entityId,
    });
    this.logger.debug(`Cleared validation results for entity ${entityId}`);
  }

  /**
   * Execute validation and store results
   * @param context Validation context
   * @param userId User ID who triggered the validation
   * @returns Array of validation results
   */
  async validateAndStore(
    context: ValidationContext,
    userId: string,
  ): Promise<ValidationRuleResult[]> {
    const results = await this.validateEntity(context);

    if (context.entityId) {
      // Clear old results and store new ones
      await this.clearValidationResults(
        context.projectId,
        context.entityType,
        context.entityId,
      );

      await this.storeValidationResults(
        context.projectId,
        context.entityType,
        context.entityId,
        results,
      );
    }

    return results;
  }

  /**
   * Check if an entity has validation errors
   * @param results Validation results
   * @returns True if there are any errors
   */
  hasErrors(results: ValidationRuleResult[]): boolean {
    return results.some(
      (r) => !r.passed && r.severity === ValidationSeverity.ERROR,
    );
  }

  /**
   * Check if an entity has validation warnings
   * @param results Validation results
   * @returns True if there are any warnings
   */
  hasWarnings(results: ValidationRuleResult[]): boolean {
    return results.some(
      (r) => !r.passed && r.severity === ValidationSeverity.WARNING,
    );
  }
}
