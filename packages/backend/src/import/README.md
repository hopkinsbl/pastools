# Import Module

## Overview

The Import module provides functionality for importing engineering data from CSV and Excel (XLSX) files into the PAStools platform. It supports file parsing, column mapping, import profile management, and asynchronous import job execution.

## Features

- **File Parsing**: Parse CSV and XLSX files to extract sheet names, column headers, and row counts
- **Import Profiles**: Save and reuse column mapping configurations for different entity types
- **Column Mapping**: Map spreadsheet columns to CDM entity fields
- **Async Import Jobs**: Execute imports as background jobs with progress tracking
- **Import Lineage**: Track source file, sheet name, and row number for each imported entity
- **Validation Integration**: Validate imported data against configured rules

## API Endpoints

### Parse File

```
POST /api/import/parse
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: file (CSV or XLSX file)

Response: {
  fileType: "xlsx",
  sheets: [
    {
      name: "Tags",
      headers: ["Tag Name", "Description", "Type", "Units"],
      rowCount: 150
    }
  ]
}
```

Parses an uploaded file and returns metadata including sheet names, column headers, and row counts.

### Create Import Profile

```
POST /api/import/profiles
Authorization: Bearer <token>

Body: {
  name: "Standard Tag Import",
  entityType: "tag",
  columnMappings: {
    "Tag Name": "name",
    "Description": "description",
    "Type": "type",
    "Units": "engineeringUnits"
  }
}

Response: {
  id: "uuid",
  name: "Standard Tag Import",
  entityType: "tag",
  columnMappings: { ... },
  createdAt: "2024-01-15T10:30:00Z",
  createdBy: "user-uuid"
}
```

Creates a new import profile with column mappings that can be reused for future imports.

### Get Import Profiles

```
GET /api/import/profiles?entityType=tag
Authorization: Bearer <token>

Response: [
  {
    id: "uuid",
    name: "Standard Tag Import",
    entityType: "tag",
    columnMappings: { ... },
    createdAt: "2024-01-15T10:30:00Z",
    createdBy: "user-uuid"
  }
]
```

Retrieves all import profiles, optionally filtered by entity type.

### Get Import Profile

```
GET /api/import/profiles/:id
Authorization: Bearer <token>

Response: {
  id: "uuid",
  name: "Standard Tag Import",
  entityType: "tag",
  columnMappings: { ... },
  createdAt: "2024-01-15T10:30:00Z",
  createdBy: "user-uuid"
}
```

Retrieves a specific import profile by ID.

### Delete Import Profile

```
DELETE /api/import/profiles/:id
Authorization: Bearer <token>

Response: 200 OK
```

Deletes an import profile.

### Start Import Job

```
POST /api/import/projects/:projectId/start
Authorization: Bearer <token>

Body: {
  filePath: "/tmp/upload/tags.xlsx",
  fileType: "xlsx",
  sheetName: "Tags",
  entityType: "tag",
  columnMappings: {
    "Tag Name": "name",
    "Description": "description",
    "Type": "type",
    "Units": "engineeringUnits"
  },
  profileId: "optional-profile-uuid"
}

Response: {
  id: "job-uuid",
  type: "Import",
  projectId: "project-uuid",
  status: "Queued",
  progress: 0,
  createdAt: "2024-01-15T10:30:00Z",
  createdBy: "user-uuid"
}
```

Starts an asynchronous import job. The job will process the file in the background and create entities based on the column mappings.

### Get Import Job Status

```
GET /api/import/jobs/:jobId
Authorization: Bearer <token>

Response: {
  id: "job-uuid",
  type: "Import",
  projectId: "project-uuid",
  status: "Running",
  progress: 45,
  result: null,
  error: null,
  createdAt: "2024-01-15T10:30:00Z",
  startedAt: "2024-01-15T10:30:05Z",
  completedAt: null,
  createdBy: "user-uuid"
}
```

Gets the current status of an import job.

### Get Project Import Jobs

```
GET /api/import/projects/:projectId/jobs
Authorization: Bearer <token>

Response: [
  {
    id: "job-uuid",
    type: "Import",
    status: "Completed",
    progress: 100,
    result: {
      success: 150,
      errors: 5,
      warnings: 10,
      errorDetails: [...]
    },
    createdAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-15T10:32:00Z"
  }
]
```

Gets all import jobs for a project.

## Data Models

### Job Entity

```typescript
{
  id: UUID
  type: "Import" | "Export" | "Validation" | "TestRun"
  projectId: UUID (Project)
  status: "Queued" | "Running" | "Completed" | "Failed" | "Cancelled"
  progress: number (0-100)
  result: {
    success: number
    errors: number
    warnings: number
    errorDetails: Array<{
      row: number
      error: string
      data: any
    }>
  }
  error: string (if failed)
  createdAt: timestamp
  startedAt: timestamp
  completedAt: timestamp
  createdBy: UUID (User)
}
```

### ImportProfile Entity

```typescript
{
  id: UUID
  name: string
  entityType: string (tag, equipment, alarm, document)
  columnMappings: {
    [fileColumn: string]: entityField
  }
  createdAt: timestamp
  createdBy: UUID (User)
}
```

### FileInfo DTO

```typescript
{
  fileType: "csv" | "xlsx"
  sheets: [
    {
      name: string
      headers: string[]
      rowCount: number
    }
  ]
}
```

## Usage Example

### 1. Upload and Parse File

```typescript
const formData = new FormData();
formData.append('file', fileBlob, 'tags.xlsx');

const fileInfo = await fetch('/api/import/parse', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

### 2. Create Import Profile

```typescript
const profile = await fetch('/api/import/profiles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: 'Standard Tag Import',
    entityType: 'tag',
    columnMappings: {
      'Tag Name': 'name',
      'Description': 'description',
      'Type': 'type',
      'Units': 'engineeringUnits',
    },
  }),
});
```

### 3. Execute Import (Future Implementation)

```typescript
const job = await fetch('/api/import/projects/:projectId/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    filePath: '/tmp/upload/tags.xlsx',
    fileType: 'xlsx',
    sheetName: 'Tags',
    entityType: 'tag',
    columnMappings: {
      'Tag Name': 'name',
      'Description': 'description',
      'Type': 'type',
      'Units': 'engineeringUnits',
    },
  }),
});

// Poll for job status
const checkStatus = async (jobId: string) => {
  const response = await fetch(`/api/import/jobs/${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
```

## Asynchronous Job Processing

Import operations are executed as background jobs using BullMQ. This allows:

- **Non-blocking imports**: Users can continue working while imports run
- **Progress tracking**: Real-time progress updates (0-100%)
- **Error handling**: Detailed error reporting per row
- **Scalability**: Multiple imports can run concurrently

### Job Lifecycle

1. **Queued**: Job is created and added to the queue
2. **Running**: Worker picks up the job and starts processing
3. **Completed**: All rows processed successfully (or with acceptable errors)
4. **Failed**: Job encountered a fatal error and stopped
5. **Cancelled**: User cancelled the job (future feature)

### Job Results

When a job completes, the result contains:

```typescript
{
  success: 145,        // Number of rows imported successfully
  errors: 5,           // Number of rows that failed
  warnings: 10,        // Number of rows with warnings
  errorDetails: [      // Details for each failed row
    {
      row: 42,
      error: "Missing required field: name",
      data: { ... }
    }
  ]
}
```

## File Format Support

### CSV Files

- Must have a header row
- Comma-separated values
- UTF-8 encoding recommended
- Maximum file size: 100MB

### XLSX Files

- Excel 2007+ format (.xlsx)
- Multiple sheets supported
- First row of each sheet is treated as headers
- Maximum file size: 100MB

## Import Lineage

Each imported entity stores lineage metadata:

```typescript
{
  importLineage: {
    sourceFile: "tags_export_2024.xlsx",
    sheetName: "Tags",
    rowNumber: 42
  }
}
```

This allows tracing any entity back to its source data.

## Validation

Import validation is handled by the Validation module. During import:

1. Each row is validated against configured rules
2. Validation results are classified as error, warning, or info
3. Rows with errors are rejected (unless override is enabled)
4. Rows with warnings can be imported with acknowledgment
5. Import report includes all validation results

## Requirements Validation

This module implements the following requirements:

- **Requirement 8.1**: Accept CSV and XLSX file uploads for import ✓
- **Requirement 8.2**: Provide mapping interface to map columns to entity fields ✓
- **Requirement 8.3**: Save and reuse import mapping profiles ✓
- **Requirement 8.5**: Store import lineage (source file, sheet, row) ✓
- **Requirement 8.7**: Execute imports as asynchronous jobs ✓

## Future Enhancements

- Import report generation with detailed statistics
- Duplicate detection during import
- Batch import optimization for large files
- Import preview before execution
- Validation integration (currently basic error handling)
- Job cancellation support
- Import rollback on failure
