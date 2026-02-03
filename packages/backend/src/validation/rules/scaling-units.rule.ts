import { Injectable } from '@nestjs/common';
import {
  IValidationRule,
  ValidationContext,
  ValidationRuleResult,
  ValidationSeverity,
} from '../interfaces/validation-rule.interface';

/**
 * Validates that tags have proper scaling and engineering units
 */
@Injectable()
export class ScalingUnitsRule implements IValidationRule {
  readonly name = 'Scaling and Units';
  readonly description =
    'Validates that tags have proper scaling and engineering units';
  readonly applicableEntityTypes = ['tag'];

  // Tag types that require scaling
  private readonly scaledTypes = ['AI', 'AO'];

  // Common engineering units by measurement type
  private readonly commonUnits = [
    // Temperature
    'degC',
    'degF',
    'K',
    // Pressure
    'bar',
    'psi',
    'kPa',
    'MPa',
    'Pa',
    // Flow
    'm3/h',
    'L/min',
    'gpm',
    'kg/h',
    't/h',
    // Level
    'm',
    'mm',
    '%',
    'cm',
    // Other
    'V',
    'mA',
    'Hz',
    'rpm',
    'kW',
    'MW',
    'pH',
  ];

  async validate(context: ValidationContext): Promise<ValidationRuleResult[]> {
    const results: ValidationRuleResult[] = [];
    const tag = context.entity;

    // Only validate tags with scaling requirements
    if (!tag.type || !this.scaledTypes.includes(tag.type)) {
      return results;
    }

    // Check for engineering units
    if (!tag.engineeringUnits || tag.engineeringUnits.trim() === '') {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: `Tag type ${tag.type} requires engineering units to be specified`,
        passed: false,
      });
    } else {
      // Warn if units are not in common list
      const units = tag.engineeringUnits.trim();
      if (!this.commonUnits.includes(units)) {
        results.push({
          ruleName: this.name,
          severity: ValidationSeverity.INFO,
          message: `Engineering units "${units}" are not in the common units list. Verify this is correct.`,
          passed: false,
        });
      }
    }

    // Check for scale values
    const hasScaleLow = tag.scaleLow !== null && tag.scaleLow !== undefined;
    const hasScaleHigh = tag.scaleHigh !== null && tag.scaleHigh !== undefined;

    if (!hasScaleLow || !hasScaleHigh) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: `Tag type ${tag.type} requires both scaleLow and scaleHigh to be specified`,
        passed: false,
      });
      return results;
    }

    // Validate scale range
    const scaleLow = Number(tag.scaleLow);
    const scaleHigh = Number(tag.scaleHigh);

    if (isNaN(scaleLow) || isNaN(scaleHigh)) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: 'Scale values must be valid numbers',
        passed: false,
      });
      return results;
    }

    if (scaleLow >= scaleHigh) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: `scaleLow (${scaleLow}) must be less than scaleHigh (${scaleHigh})`,
        passed: false,
      });
    }

    // Check for reasonable scale range
    const range = scaleHigh - scaleLow;
    if (range === 0) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.ERROR,
        message: 'Scale range cannot be zero',
        passed: false,
      });
    } else if (range < 0.001) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.WARNING,
        message: `Scale range (${range}) is very small. Verify this is correct.`,
        passed: false,
      });
    } else if (range > 1000000) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.WARNING,
        message: `Scale range (${range}) is very large. Verify this is correct.`,
        passed: false,
      });
    }

    // Check for negative scales where they might not make sense
    if (tag.engineeringUnits) {
      const units = tag.engineeringUnits.toLowerCase();
      const absoluteUnits = ['k', 'degc', 'degf']; // Units that can be negative
      const isAbsoluteUnit = absoluteUnits.some((u) => units.includes(u));

      if (!isAbsoluteUnit && scaleLow < 0) {
        results.push({
          ruleName: this.name,
          severity: ValidationSeverity.INFO,
          message: `Negative scaleLow (${scaleLow}) with units "${tag.engineeringUnits}". Verify this is correct.`,
          passed: false,
        });
      }
    }

    return results;
  }
}
