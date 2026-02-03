# Validation Module

## Overview

The Validation module provides a flexible framework for validating engineering data against configurable rules. It supports validation rule packs for naming conventions, scaling/units, duplicates, and alarm completeness.

## Features

- **Rule Framework**: Extensible validation rule interface
- **Rule Registry**: Central registry for managing validation rules
- **Validation Engine**: Executes rules and stores results
- **Result Management**: Store, query, and acknowledge validation results
- **Severity Classification**: Errors, warnings, and info levels
- **Built-in Rules**: Naming conventions, scaling/units, duplicates, alarm completeness

## Architecture

### Components

1. **IValidationRule Interface**: Contract that all validation rules must implement
2. **ValidationRuleRegistry**: Manages registration and retrieval of validation rules
3. **ValidationEngine**: Executes validation rules and stores results
4. **ValidationService**: High-level service for validation operations
5. **ValidationController**: REST API endpoints for validation

### Validation Flow

```
Entity Data → ValidationEngine → Execute Rules → Store Results → Return Results
                    ↓
              Rule Registry
                    ↓
            [Rule 1, Rule 2, ...]
```

## API Endpoints

### Run Validation

```
POST /api/projects/:projectId/validate
```

Run validation rules on an entity.

**Request Body:**
```json
{
  "entityType": "tag",
  "entityId": "uuid",
  "entity": {
    "name": "AI-101",
    "type": "AI",
    "scaleLow": 0,
    "scaleHigh": 100
  }
}
```

**Response:**
```json
[
  {
    "ruleName": "Naming Convention",
    "severity": "Warning",
    "message": "Tag name should follow pattern: TYPE-NUMBER",
    "passed": false
  }
]
```

### Get Validation Results

```
GET /api/projects/:projectId/validation-results?entityType=tag
```

Get all validation results for a project, optionally filtered by entity type.

### Get Entity Validation Results

```
GET /api/projects/:projectId/validation-results/:entityType/:entityId
```

Get validation results for a specific entity.

### Get Validation Summary

```
GET /api/projects/:projectId/validation-summary
```

Get validation summary statistics for a project.

**Response:**
```json
{
  "total": 45,
  "errors": 5,
  "warnings": 30,
  "info": 10,
  "acknowledged": 15,
  "byEntityType": {
    "tag": 25,
    "alarm": 20
  },
  "byRule": {
    "Naming Convention": 20,
    "Scaling Units": 15,
    "Duplicate Detection": 10
  }
}
```

### Acknowledge Warning

```
POST /api/validation-results/:id/acknowledge
```

Acknowledge a validation warning (errors cannot be acknowledged).

## Creating Custom Validation Rules

### 1. Implement IValidationRule Interface

```typescript
import { Injectable } from '@nestjs/common';
import {
  IValidationRule,
  ValidationContext,
  ValidationRuleResult,
  ValidationSeverity,
} from '../interfaces/validation-rule.interface';

@Injectable()
export class MyCustomRule implements IValidationRule {
  readonly name = 'My Custom Rule';
  readonly description = 'Validates custom business logic';
  readonly applicableEntityTypes = ['tag', 'equipment'];

  async validate(context: ValidationContext): Promise<ValidationRuleResult[]> {
    const results: ValidationRuleResult[] = [];
    
    // Your validation logic here
    if (/* some condition */) {
      results.push({
        ruleName: this.name,
        severity: ValidationSeverity.WARNING,
        message: 'Validation failed: reason',
        passed: false,
      });
    }
    
    return results;
  }
}
```

### 2. Register the Rule

Add to `validation.module.ts`:

```typescript
@Module({
  providers: [
    // ... existing providers
    MyCustomRule,
  ],
})
export class ValidationModule {
  constructor(
    private readonly registry: ValidationRuleRegistry,
    private readonly myCustomRule: MyCustomRule,
  ) {
    this.registry.registerRule(this.myCustomRule);
  }
}
```

## Built-in Validation Rules

### 1. Naming Convention Rule

Validates that entity names follow standard naming patterns.

- **Applies to**: tags, equipment
- **Severity**: Warning
- **Example**: Tag names should match pattern `TYPE-NUMBER` (e.g., AI-101)

### 2. Scaling/Units Rule

Validates that tags have proper scaling and engineering units.

- **Applies to**: tags (AI, AO types)
- **Severity**: Error for missing units, Warning for invalid ranges
- **Checks**:
  - Engineering units are specified
  - Scale low < scale high
  - Scale range is reasonable

### 3. Duplicate Detection Rule

Detects potential duplicate entities based on name matching.

- **Applies to**: all entity types
- **Severity**: Warning
- **Checks**: Entities with identical or very similar names

### 4. Alarm Completeness Rule

Validates that alarms have all required rationalization fields.

- **Applies to**: alarms
- **Severity**: Error for missing required fields, Warning for incomplete fields
- **Checks**:
  - Priority is set
  - Setpoint is defined
  - Rationalization is provided
  - Consequence is documented
  - Operator action is specified

## Integration with Import Process

The validation module integrates with the import process to validate imported data:

```typescript
// In import processor
const validationResults = await this.validationEngine.validateEntity({
  projectId,
  entityType: 'tag',
  entity: importedTag,
});

if (this.validationEngine.hasErrors(validationResults)) {
  // Reject import row
  importReport.errors.push({
    row: rowNumber,
    errors: validationResults.filter(r => r.severity === 'Error'),
  });
} else if (this.validationEngine.hasWarnings(validationResults)) {
  // Include warnings in report but allow import
  importReport.warnings.push({
    row: rowNumber,
    warnings: validationResults.filter(r => r.severity === 'Warning'),
  });
}
```

## Validation Result Storage

Validation results are stored in the `validation_result` table:

```typescript
{
  id: UUID
  projectId: UUID
  entityType: string
  entityId: UUID
  ruleName: string
  severity: 'Error' | 'Warning' | 'Info'
  message: string
  acknowledged: boolean
  createdAt: timestamp
}
```

## Error Handling

- **Rule Execution Errors**: If a rule throws an exception, it's caught and recorded as an error result
- **Missing Rules**: If a requested rule doesn't exist, a warning is logged
- **Invalid Entity Types**: Rules that don't apply to an entity type are skipped

## Requirements Validation

This module validates the following requirements:

- **Requirement 9.1**: Support validation rule packs for naming conventions, scaling/units, duplicates, and alarm completeness
- **Requirement 9.2**: Execute applicable validation rules when data is imported or updated
- **Requirement 9.3**: Classify validation results as errors, warnings, or info
- **Requirement 9.5**: Allow users to acknowledge or suppress specific validation warnings
- **Requirement 9.6**: Prevent saving entities with validation errors unless overridden by authorized users

## Testing

Run validation module tests:

```bash
npm test -- validation
```

## Future Enhancements

- Custom rule configuration via UI
- Rule priority and ordering
- Conditional rule execution based on project settings
- Batch validation for multiple entities
- Validation rule versioning
- Export validation reports
