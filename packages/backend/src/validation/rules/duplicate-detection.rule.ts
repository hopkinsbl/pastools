import { Injectable } from '@nestjs/common';
import {
  IValidationRule,
  ValidationContext,
  ValidationRuleResult,
  ValidationSeverity,
} from '../interfaces/validation-rule.interface';

/**
 * Detects potential duplicate entities based on name matching
 */
@Injectable()
export class DuplicateDetectionRule implements IValidationRule {
  readonly name = 'Duplicate Detection';
  readonly description =
    'Detects potential duplicate entities based on name matching';
  readonly applicableEntityTypes = []; // Applies to all entity types

  async validate(context: ValidationContext): Promise<ValidationRuleResult[]> {
    const results: ValidationRuleResult[] = [];
    const entity = context.entity;

    if (!entity.name) {
      return results;
    }

    const entityName = entity.name.trim().toLowerCase();

    // If allEntities is provided, check for duplicates
    if (context.allEntities && context.allEntities.length > 0) {
      const duplicates = context.allEntities.filter((other) => {
        // Skip self-comparison if entity has an ID
        if (entity.id && other.id === entity.id) {
          return false;
        }

        if (!other.name) {
          return false;
        }

        const otherName = other.name.trim().toLowerCase();

        // Exact match
        if (entityName === otherName) {
          return true;
        }

        // Very similar names (Levenshtein distance or simple similarity)
        return this.areSimilar(entityName, otherName);
      });

      if (duplicates.length > 0) {
        const duplicateNames = duplicates
          .map((d) => d.name)
          .slice(0, 5)
          .join(', ');
        const moreCount = duplicates.length > 5 ? ` and ${duplicates.length - 5} more` : '';

        results.push({
          ruleName: this.name,
          severity: ValidationSeverity.WARNING,
          message: `Potential duplicate detected. Similar entities found: ${duplicateNames}${moreCount}`,
          passed: false,
        });
      }
    }

    // Check for common duplicate patterns
    this.checkCommonDuplicatePatterns(entity.name, results);

    return results;
  }

  /**
   * Check if two names are similar using simple heuristics
   */
  private areSimilar(name1: string, name2: string): boolean {
    // Remove common separators for comparison
    const normalize = (s: string) =>
      s.replace(/[-_\s]/g, '').toLowerCase();

    const norm1 = normalize(name1);
    const norm2 = normalize(name2);

    // Check if one is contained in the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      return true;
    }

    // Check Levenshtein distance for short strings
    if (norm1.length <= 10 && norm2.length <= 10) {
      const distance = this.levenshteinDistance(norm1, norm2);
      const maxLength = Math.max(norm1.length, norm2.length);
      const similarity = 1 - distance / maxLength;
      return similarity > 0.8; // 80% similar
    }

    return false;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost, // substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Check for common duplicate patterns like trailing numbers or letters
   */
  private checkCommonDuplicatePatterns(
    name: string,
    results: ValidationRuleResult[],
  ): void {
    // Check for trailing copy indicators
    const copyPatterns = [
      /\s*\(copy\)$/i,
      /\s*\(duplicate\)$/i,
      /\s*-\s*copy$/i,
      /\s*_copy$/i,
      /\s*\(\d+\)$/,
    ];

    for (const pattern of copyPatterns) {
      if (pattern.test(name)) {
        results.push({
          ruleName: this.name,
          severity: ValidationSeverity.INFO,
          message: `Entity name "${name}" appears to be a copy. Consider using a unique name.`,
          passed: false,
        });
        break;
      }
    }
  }
}
