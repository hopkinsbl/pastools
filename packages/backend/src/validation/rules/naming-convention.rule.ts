import { Injectable } from '@nestjs/common';
import {
  IValidationRule,
  ValidationContext,
  ValidationRuleResult,
  ValidationSeverity,
} from '../interfaces/validation-rule.interface';

/**
 * Validates entity names follow standard naming conventions
 */
@Injectable()
export class NamingConventionRule implements IValidationRule {
  readonly name = 'Naming Convention';
  readonly description =
    'Validates that entity names follow standard naming patterns';
  readonly applicableEntityTypes = ['tag', 'equipment'];

  // Tag naming patterns by type
  private readonly tagPatterns: Record<string, RegExp> = {
    AI: /^AI[-_]\d+[A-Z]?$/i, // AI-101, AI_101A
    AO: /^AO[-_]\d+[A-Z]?$/i, // AO-201, AO_201B
    DI: /^DI[-_]\d+[A-Z]?$/i, // DI-301
    DO: /^DO[-_]\d+[A-Z]?$/i, // DO-401
    PID: /^PID[-_]\d+[A-Z]?$/i, // PID-501
    Valve: /^[A-Z]{2,3}V[-_]\d+[A-Z]?$/i, // FV-101, HCV_201
    Drive: /^[A-Z]{2,3}D[-_]\d+[A-Z]?$/i, // MD-101, SPD_201
    Totaliser: /^[A-Z]{2,3}T[-_]\d+[A-Z]?$/i, // FT-101, TT_201
    Calc: /^CALC[-_]\d+[A-Z]?$/i, // CALC-101
  };

  // Equipment naming pattern: alphanumeric with hyphens/underscores
  private readonly equipmentPattern = /^[A-Z0-9][-_A-Z0-9]*$/i;

  async validate(context: ValidationContext): Promise<ValidationRuleResult[]> {
    const results: ValidationRuleResult[] = [];
    const entity = context.entity;

    if (!entity.name) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: 'Entity name is required',
        passed: false,
      });
      return results;
    }

    const name = entity.name.trim();

    // Check for empty name
    if (name.length === 0) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: 'Entity name cannot be empty',
        passed: false,
      });
      return results;
    }

    // Check for minimum length
    if (name.length < 3) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.WARNING,
        message: 'Entity name is too short (minimum 3 characters)',
        passed: false,
      });
    }

    // Check for maximum length
    if (name.length > 50) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: 'Entity name is too long (maximum 50 characters)',
        passed: false,
      });
    }

    // Validate based on entity type
    if (context.entityType === 'tag') {
      this.validateTagName(entity, results);
    } else if (context.entityType === 'equipment') {
      this.validateEquipmentName(name, results);
    }

    return results;
  }

  private validateTagName(
    tag: any,
    results: ValidationRuleResult[],
  ): void {
    const name = tag.name.trim();
    const tagType = tag.type;

    if (!tagType) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.WARNING,
        message: 'Tag type is not specified, cannot validate naming pattern',
        passed: false,
      });
      return;
    }

    const pattern = this.tagPatterns[tagType];
    if (!pattern) {
      // Unknown tag type, skip pattern validation
      return;
    }

    if (!pattern.test(name)) {
      const exampleName = this.getExampleName(tagType);
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.WARNING,
        message: `Tag name "${name}" does not follow standard pattern for type ${tagType}. Expected format: ${exampleName}`,
        passed: false,
      });
    }

    // Check for special characters
    if (/[^A-Z0-9_-]/i.test(name)) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.WARNING,
        message: 'Tag name contains special characters. Use only letters, numbers, hyphens, and underscores',
        passed: false,
      });
    }
  }

  private validateEquipmentName(
    name: string,
    results: ValidationRuleResult[],
  ): void {
    if (!this.equipmentPattern.test(name)) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.WARNING,
        message: `Equipment name "${name}" should contain only letters, numbers, hyphens, and underscores`,
        passed: false,
      });
    }

    // Check for leading/trailing special characters
    if (/^[-_]|[-_]$/.test(name)) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.WARNING,
        message: 'Equipment name should not start or end with hyphens or underscores',
        passed: false,
      });
    }
  }

  private getExampleName(tagType: string): string {
    const examples: Record<string, string> = {
      AI: 'AI-101',
      AO: 'AO-201',
      DI: 'DI-301',
      DO: 'DO-401',
      PID: 'PID-501',
      Valve: 'FV-101',
      Drive: 'MD-101',
      Totaliser: 'FT-101',
      Calc: 'CALC-101',
    };
    return examples[tagType] || `${tagType}-101`;
  }
}
