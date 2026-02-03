import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationResult } from '../entities/validation-result.entity';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';
import { ValidationEngine } from './validation.engine';
import { ValidationRuleRegistry } from './validation-rule.registry';
import { ProjectsModule } from '../projects/projects.module';

// Import built-in validation rules
import { NamingConventionRule } from './rules/naming-convention.rule';
import { ScalingUnitsRule } from './rules/scaling-units.rule';
import { DuplicateDetectionRule } from './rules/duplicate-detection.rule';
import { AlarmCompletenessRule } from './rules/alarm-completeness.rule';

@Module({
  imports: [TypeOrmModule.forFeature([ValidationResult]), ProjectsModule],
  controllers: [ValidationController],
  providers: [
    ValidationService,
    ValidationEngine,
    ValidationRuleRegistry,
    // Built-in validation rules
    NamingConventionRule,
    ScalingUnitsRule,
    DuplicateDetectionRule,
    AlarmCompletenessRule,
  ],
  exports: [ValidationService, ValidationEngine, ValidationRuleRegistry],
})
export class ValidationModule {
  constructor(
    private readonly registry: ValidationRuleRegistry,
    private readonly namingConventionRule: NamingConventionRule,
    private readonly scalingUnitsRule: ScalingUnitsRule,
    private readonly duplicateDetectionRule: DuplicateDetectionRule,
    private readonly alarmCompletenessRule: AlarmCompletenessRule,
  ) {
    // Register built-in rules on module initialization
    this.registry.registerRules([
      this.namingConventionRule,
      this.scalingUnitsRule,
      this.duplicateDetectionRule,
      this.alarmCompletenessRule,
    ]);
  }
}
