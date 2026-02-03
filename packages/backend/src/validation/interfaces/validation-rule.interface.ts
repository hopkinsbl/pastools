/**
 * Severity levels for validation results
 */
export enum ValidationSeverity {
  ERROR = 'Error',
  WARNING = 'Warning',
  INFO = 'Info',
}

/**
 * Context provided to validation rules during execution
 */
export interface ValidationContext {
  projectId: string;
  entityType: string;
  entityId?: string;
  entity: any;
  allEntities?: any[]; // For cross-entity validation (e.g., duplicate detection)
}

/**
 * Result of a validation rule execution
 */
export interface ValidationRuleResult {
  ruleName: string;
  severity: ValidationSeverity;
  message: string;
  passed: boolean;
}

/**
 * Interface that all validation rules must implement
 */
export interface IValidationRule {
  /**
   * Unique name for the validation rule
   */
  readonly name: string;

  /**
   * Description of what the rule validates
   */
  readonly description: string;

  /**
   * Entity types this rule applies to (e.g., 'tag', 'equipment', 'alarm')
   * Empty array means applies to all entity types
   */
  readonly applicableEntityTypes: string[];

  /**
   * Execute the validation rule
   * @param context Validation context containing entity and project information
   * @returns Array of validation results (can be empty if all checks pass)
   */
  validate(context: ValidationContext): Promise<ValidationRuleResult[]>;
}
