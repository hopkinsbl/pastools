# Export Module

## Overview

The Export module provides functionality to export engineering data from the PAStools platform to CSV and XLSX formats. Exports are processed as asynchronous background jobs to handle large datasets without blocking the API.

## Features

- Export tags, equipment, alarms, documents, technical queries, and punchlist items
- Support for CSV and XLSX formats
- Configurable column selection
- Optional filtering of data
- Asynchronous job processing with progress tracking
- Download links for completed exports

## API Endpoints

### Start Export

```
POST /api/projects/:projectId/export
```

Creates an export job for the specified entity type and format.

**Request Body:**
```json
{
  "entityType": "tag",
  "format": "xlsx",
  "columns": ["name", "description", "type", "engineeringUnits"],
  "filters": {
    "type": "AI"
  }
}
```

**Response:**
```json
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "Queued",
  "message": "Export job created successfully"
}
```

### Get Job Status

```
GET /api/projects/:projectId/export/jobs/:jobId
```

Retrieves the status and progress of an export job.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "type": "Export",
  "status": "Completed",
  "progress": 100,
  "result": {
    "filePath": "/path/to/export.xlsx",
    "fileName": "tag_export_1234567890.xlsx",
    "recordCount": 150
  },
  "createdAt": "2024-01-27T10:00:00Z",
  "startedAt": "2024-01-27T10:00:01Z",
  "completedAt": "2024-01-27T10:00:05Z"
}
```

### Download Export File

```
GET /api/projects/:projectId/export/jobs/:jobId/download
```

Downloads the generated export file.

**Response:** File stream with appropriate headers for download.

## Supported Entity Types

- `tag` - Tags (AI, AO, DI, DO, PID, Valve, Drive, Totaliser, Calc)
- `equipment` - Equipment items
- `alarm` - Alarms with rationalization fields
- `document` - Documents
- `tq` - Technical queries
- `punchlist` - Punchlist items

## Export Formats

### CSV

- Plain text format with comma-separated values
- Header row with column names
- Compatible with Excel, Google Sheets, and other tools

### XLSX

- Microsoft Excel format
- Single worksheet named "Export"
- Formatted with column headers

## Column Selection

Specify which columns to include in the export using the `columns` array. Column names should match entity field names.

**Example for Tags:**
```json
{
  "columns": [
    "name",
    "description",
    "type",
    "engineeringUnits",
    "scaleLow",
    "scaleHigh"
  ]
}
```

**Example for Alarms (with nested fields):**
```json
{
  "columns": [
    "priority",
    "setpoint",
    "rationalization",
    "tag.name",
    "tag.description"
  ]
}
```

## Filtering

Apply filters to export only specific records:

```json
{
  "filters": {
    "type": "AI",
    "status": "active"
  }
}
```

## Job Processing

Exports are processed asynchronously using BullMQ:

1. Client submits export request
2. Job is created with status "Queued"
3. Worker picks up job and updates status to "Running"
4. Data is fetched from database
5. Export file is generated
6. Job status updated to "Completed" with download link
7. Client downloads file using job ID

## Error Handling

If an export job fails:
- Job status is set to "Failed"
- Error message is stored in job record
- Client can retry by submitting a new export request

## File Storage

Export files are stored in the `exports/` directory with timestamped filenames:
- Format: `{entityType}_export_{timestamp}.{format}`
- Example: `tag_export_1706356800000.xlsx`

## Requirements Validation

This module validates the following requirements:

- **Requirement 10.1**: Export tag lists to CSV and XLSX formats with configurable column selection
- **Requirement 10.2**: Export alarm lists to CSV and XLSX formats with rationalization fields
- **Requirement 10.3**: Export register lists to CSV and XLSX formats
- **Requirement 10.4**: Allow users to select export format and columns
- **Requirement 10.5**: Execute exports as asynchronous jobs with progress tracking and download link

## Usage Example

```typescript
// Start export
const response = await fetch('/api/projects/project-123/export', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    entityType: 'tag',
    format: 'xlsx',
    columns: ['name', 'description', 'type'],
    filters: { type: 'AI' }
  })
});

const { jobId } = await response.json();

// Poll for job status
const statusResponse = await fetch(
  `/api/projects/project-123/export/jobs/${jobId}`
);
const status = await statusResponse.json();

// Download when complete
if (status.status === 'Completed') {
  window.location.href = 
    `/api/projects/project-123/export/jobs/${jobId}/download`;
}
```

## Dependencies

- `csv-writer` - CSV file generation
- `xlsx` - Excel file generation
- `bullmq` - Job queue processing
- `typeorm` - Database queries
