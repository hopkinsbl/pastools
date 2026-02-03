import { Injectable } from '@nestjs/common';
import {
  IValidationRule,
  ValidationContext,
  ValidationRuleResult,
  ValidationSeverity,
} from '../interfaces/validation-rule.interface';

/**
 * Validates that alarms have all required rationalization fields
 */
@Injectable()
export class AlarmCompletenessRule implements IValidationRule {
  readonly name = 'Alarm Completeness';
  readonly description =
    'Validates that alarms have all required rationalization fields';
  readonly applicableEntityTypes = ['alarm'];

  private readonly validPriorities = ['Critical', 'High', 'Medium', 'Low'];

  async validate(context: ValidationContext): Promise<ValidationRuleResult[]> {
    const results: ValidationRuleResult[] = [];
    const alarm = context.entity;

    // Check priority
    if (!alarm.priority) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: 'Alarm priority is required',
        passed: false,
      });
    } else if (!this.validPriorities.includes(alarm.priority)) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: `Invalid alarm priority "${alarm.priority}". Must be one of: ${this.validPriorities.join(', ')}`,
        passed: false,
      });
    }

    // Check setpoint
    if (alarm.setpoint === null || alarm.setpoint === undefined) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: 'Alarm setpoint is required',
        passed: false,
      });
    } else {
      const setpoint = Number(alarm.setpoint);
      if (isNaN(setpoint)) {
        results.push({
          ruleName: this.name,
          severity: ValidationSeverity.ERROR,
          message: 'Alarm setpoint must be a valid number',
          passed: false,
        });
      }
    }

    // Check tag reference
    if (!alarm.tagId) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: 'Alarm must be linked to a tag',
        passed: false,
      });
    }

    // Check rationalization fields
    this.checkRationalizationField(
      alarm.rationalization,
      'rationalization',
      results,
    );
    this.checkRationalizationField(
      alarm.consequence,
      'consequence',
      results,
    );
    this.checkRationalizationField(
      alarm.operatorAction,
      'operator action',
      results,
    );

    // Check for completeness of rationalization
    if (alarm.rationalization) {
      const rationalization = alarm.rationalization.trim();
      if (rationalization.length < 10) {
        results.push({
          ruleName: this.name,
          severity: ValidationSeverity.WARNING,
          message: 'Alarm rationalization is too brief. Provide detailed justification.',
          passed: false,
        });
      }
    }

    if (alarm.consequence) {
      const consequence = alarm.consequence.trim();
      if (consequence.length < 10) {
        results.push({
          ruleName: this.name,
          severity: ValidationSeverity.WARNING,
          message: 'Alarm consequence description is too brief. Provide detailed impact analysis.',
          passed: false,
        });
      }
    }

    if (alarm.operatorAction) {
      const operatorAction = alarm.operatorAction.trim();
      if (operatorAction.length < 10) {
        results.push({
          ruleName: this.name,
          severity: ValidationSeverity.WARNING,
          message: 'Operator action description is too brief. Provide clear instructions.',
          passed: false,
        });
      }
    }

    // Check for placeholder text
    this.checkForPlaceholders(alarm, results);

    return results;
  }

  private checkRationalizationField(
    value: any,
    fieldName: string,
    results: ValidationRuleResult[],
  ): void {
    if (!value || value.trim() === '') {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: `Alarm ${fieldName} is required for proper alarm rationalization`,
        passed: false,
      });
    }
  }

  private checkForPlaceholders(
    alarm: any,
    results: ValidationRuleResult[],
  ): void {
    const placeholderPatterns = [
      /^tbd$/i,
      /^to be determined$/i,
      /^todo$/i,
      /^n\/a$/i,
      /^na$/i,
      /^none$/i,
      /^xxx$/i,
      /^\?\?+$/,
    ];

    const fields = [
      { name: 'rationalization', value: alarm.rationalization },
      { name: 'consequence', value: alarm.consequence },
      { name: 'operator action', value: alarm.operatorAction },
    ];

    for (const field of fields) {
      if (field.value) {
        const trimmed = field.value.trim();
        for (const pattern of placeholderPatterns) {
          if (pattern.test(trimmed)) {
            results.push({
              ruleName: this.name,
              severity: ValidationSeverity.WARNING,
              message: `Alarm ${field.name} contains placeholder text "${trimmed}". Replace with actual content.`,
              passed: false,
            });
            break;
          }
        }
      }
    }
  }
}
