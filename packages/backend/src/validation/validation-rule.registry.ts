import { Injectable, Logger } from '@nestjs/common';
import { IValidationRule } from './interfaces/validation-rule.interface';

/**
 * Registry for managing validation rules
 * Allows registration and retrieval of validation rules
 */
@Injectable()
export class ValidationRuleRegistry {
  private readonly logger = new Logger(ValidationRuleRegistry.name);
  private readonly rules: Map<string, IValidationRule> = new Map();

  /**
   * Register a validation rule
   * @param rule The validation rule to register
   */
  registerRule(rule: IValidationRule): void {
    if (this.rules.has(rule.name)) {
      this.logger.warn(
        `Validation rule "${rule.name}" is already registered. Overwriting.`,
      );
    }
    this.rules.set(rule.name, rule);
    this.logger.log(`Registered validation rule: ${rule.name}`);
  }

  /**
   * Register multiple validation rules
   * @param rules Array of validation rules to register
   */
  registerRules(rules: IValidationRule[]): void {
    rules.forEach((rule) => this.registerRule(rule));
  }

  /**
   * Get a validation rule by name
   * @param name Name of the validation rule
   * @returns The validation rule or undefined if not found
   */
  getRule(name: string): IValidationRule | undefined {
    return this.rules.get(name);
  }

  /**
   * Get all registered validation rules
   * @returns Array of all validation rules
   */
  getAllRules(): IValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get validation rules applicable to a specific entity type
   * @param entityType The entity type (e.g., 'tag', 'equipment')
   * @returns Array of applicable validation rules
   */
  getRulesForEntityType(entityType: string): IValidationRule[] {
    return this.getAllRules().filter(
      (rule) =>
        rule.applicableEntityTypes.length === 0 ||
        rule.applicableEntityTypes.includes(entityType),
    );
  }

  /**
   * Check if a rule is registered
   * @param name Name of the validation rule
   * @returns True if the rule is registered
   */
  hasRule(name: string): boolean {
    return this.rules.has(name);
  }

  /**
   * Unregister a validation rule
   * @param name Name of the validation rule to unregister
   * @returns True if the rule was unregistered, false if it wasn't registered
   */
  unregisterRule(name: string): boolean {
    const result = this.rules.delete(name);
    if (result) {
      this.logger.log(`Unregistered validation rule: ${name}`);
    }
    return result;
  }

  /**
   * Clear all registered rules
   */
  clearAll(): void {
    this.rules.clear();
    this.logger.log('Cleared all validation rules');
  }

  /**
   * Get count of registered rules
   */
  getRuleCount(): number {
    return this.rules.size;
  }
}
