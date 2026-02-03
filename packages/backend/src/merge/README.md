# Merge Module

## Purpose

The Merge module provides functionality for detecting duplicate entities and merging them while preserving all relationships (links and attachments). This is essential for maintaining data quality during imports and manual data entry.

## Features

- **Duplicate Detection**: Configurable match rules to identify potential duplicates
- **Flexible Matching**: Support for exact matching and fuzzy matching with similarity thresholds
- **Multiple Merge Strategies**: Skip, overwrite, or field-level merge
- **Relationship Preservation**: Automatically transfers all links and attachments to merged entity
- **Audit Trail**: Records all merge operations in audit log

## API Endpoints

### POST /api/projects/:projectId/merge/detect-duplicates

Detect duplicate entities based on configurable match rules.

**Request Body:**
```json
{
  "entityType": "tag",
  "entities": [
    { "name": "FIC-101", "description": "Flow controller" }
  ],
  "matchRule": {
    "entityType": "tag",
    "matchFields": ["name"],
    "caseSensitive": false,
    "exactMatch": false,
    "similarityThreshold": 0.8
  }
}
```

**Response:**
```json
[
  {
    "existingEntity": { "id": "uuid", "name": "FIC-101", ... },
    "newEntity": { "name": "FIC-101", ... },
    "matchScore": 1.0,
    "matchedFields": ["name"]
  }
]
```

### POST /api/projects/:projectId/merge/merge

Merge two entities using the specified strategy.

**Request Body:**
```json
{
  "entityType": "tag",
  "sourceEntityId": "uuid-source",
  "targetEntityId": "uuid-target",
  "strategy": "merge_fields",
  "fieldSelections": {
    "name": "source",
    "description": "target"
  }
}
```

**Response:**
```json
{
  "success": true,
  "mergedEntityId": "uuid-target",
  "preservedLinks": 5,
  "preservedAttachments": 3,
  "auditLogId": "uuid-audit"
}
```

## Merge Strategies

### SKIP
Keep the existing entity unchanged. Source entity is deleted but no data is transferred.

### OVERWRITE
Replace all fields in target entity with values from source entity. Target entity ID is preserved.

### MERGE_FIELDS
Selectively choose which fields to take from source vs target. Requires `fieldSelections` parameter.

## Match Rules

Match rules control how duplicates are detected:

- **matchFields**: Array of field names to compare (e.g., ["name", "tagId"])
- **caseSensitive**: Whether string comparison is case-sensitive (default: false)
- **exactMatch**: Whether to require exact matches or use fuzzy matching (default: false)
- **similarityThreshold**: For fuzzy matching, minimum similarity score 0-1 (default: 0.8)

## Duplicate Detection Algorithm

1. Fetch all existing entities of the specified type in the project
2. For each new entity, compare against all existing entities
3. For each field in matchFields:
   - Calculate similarity score (exact match = 1.0, fuzzy uses Levenshtein distance)
4. Average scores across all match fields
5. If average score >= similarityThreshold, mark as duplicate candidate

## Merge Process

1. Start database transaction
2. Fetch source and target entities
3. Apply merge strategy to create merged entity
4. Save merged entity (overwrites target)
5. Transfer all links from source to target
6. Transfer all attachments from source to target
7. Delete source entity
8. Create audit log entry
9. Commit transaction

If any step fails, transaction is rolled back and error is returned.

## Usage Examples

### Detect Duplicates During Import

```typescript
const duplicates = await mergeService.detectDuplicates(
  projectId,
  'tag',
  importedTags,
  {
    entityType: 'tag',
    matchFields: ['name'],
    caseSensitive: false,
    exactMatch: false,
    similarityThreshold: 0.9,
  }
);

// Present duplicates to user for review
```

### Merge Entities with Field Selection

```typescript
const result = await mergeService.mergeEntities(
  {
    entityType: 'tag',
    sourceEntityId: 'old-tag-id',
    targetEntityId: 'new-tag-id',
    strategy: MergeStrategy.MERGE_FIELDS,
    fieldSelections: {
      name: 'source',
      description: 'target',
      engineeringUnits: 'source',
    },
  },
  userId
);
```

## Requirements Validation

- **Requirement 11.1**: Configurable match rules for duplicate detection ✓
- **Requirement 11.2**: Duplicate candidates presented to user (via API) ✓
- **Requirement 11.3**: Merge endpoint with strategy selection ✓
- **Requirement 11.4**: Preserves all links and attachments ✓
- **Requirement 11.5**: Records merge in audit log ✓

## Integration with Import Module

The merge module can be integrated with the import process to detect and handle duplicates automatically:

1. Import module detects duplicates using `detectDuplicates()`
2. User reviews duplicate candidates in UI
3. User selects merge strategy for each duplicate
4. Import module calls `mergeEntities()` for approved merges
5. Import continues with remaining entities

## Future Enhancements

- Batch merge operations
- Merge preview (show what merged entity will look like)
- Undo merge functionality
- Custom merge strategies via plugins
- Machine learning-based duplicate detection
