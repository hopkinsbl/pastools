# Jobs Module

## Overview

The Jobs module provides centralized job management for all asynchronous operations in PAStools. It tracks job status, progress, results, and errors for import, export, validation, and test execution jobs.

## Features

- Job status tracking (Queued, Running, Completed, Failed, Cancelled)
- Progress monitoring (0-100%)
- Job result and error storage
- Job cancellation for running jobs
- Job retry for failed jobs
- Job statistics and filtering
- Automatic timestamp tracking (created, started, completed)

## API Endpoints

### Get All Jobs

```
GET /api/jobs
GET /api/jobs?status=Running
```

Returns all jobs, optionally filtered by status.

**Query Parameters:**
- `status` (optional): Filter by job status (Queued, Running, Completed, Failed, Cancelled)

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "type": "Import",
    "projectId": "proj-123",
    "projectName": "Plant A Commissioning",
    "status": "Running",
    "progress": 45,
    "createdAt": "2024-01-15T10:30:00Z",
    "startedAt": "2024-01-15T10:30:05Z",
    "createdBy": "user-123",
    "createdByName": "John Doe"
  }
]
```

### Get Job by ID

```
GET /api/jobs/:id
```

Returns detailed information about a specific job.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "type": "Import",
  "projectId": "proj-123",
  "projectName": "Plant A Commissioning",
  "status": "Completed",
  "progress": 100,
  "result": {
    "recordsProcessed": 100,
    "recordsCreated": 95,
    "errors": 5
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "startedAt": "2024-01-15T10:30:05Z",
  "completedAt": "2024-01-15T10:35:00Z",
  "createdBy": "user-123",
  "createdByName": "John Doe"
}
```

### Get Project Jobs

```
GET /api/jobs/projects/:projectId
```

Returns all jobs for a specific project, ordered by creation date (newest first).

### Get Project Job Statistics

```
GET /api/jobs/projects/:projectId/stats
```

Returns job statistics for a project.

**Response:**
```json
{
  "total": 150,
  "queued": 5,
  "running": 3,
  "completed": 130,
  "failed": 10,
  "cancelled": 2
}
```

### Cancel Job

```
POST /api/jobs/:id/cancel
```

Cancels a queued or running job. Only jobs in Queued or Running status can be cancelled.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "Cancelled",
  "completedAt": "2024-01-15T10:32:00Z"
}
```

### Retry Job

```
POST /api/jobs/:id/retry
```

Resets a failed or cancelled job to Queued status for retry. Only jobs in Failed or Cancelled status can be retried.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "Queued",
  "progress": 0,
  "error": null,
  "startedAt": null,
  "completedAt": null
}
```

## Job Types

- **Import**: Data import from CSV/XLSX files
- **Export**: Data export to CSV/XLSX files
- **Validation**: Validation rule execution
- **TestRun**: Test scenario execution

## Job Statuses

- **Queued**: Job is waiting to be processed
- **Running**: Job is currently being processed
- **Completed**: Job finished successfully
- **Failed**: Job encountered an error
- **Cancelled**: Job was cancelled by user

## Usage in Other Modules

### Creating a Job

```typescript
import { JobsService } from '../jobs/jobs.service';
import { JobType } from '../entities/job.entity';

// In your service
constructor(private readonly jobsService: JobsService) {}

async startImport(projectId: string, userId: string) {
  // Create job record
  const job = await this.jobsService.createJob(
    projectId,
    JobType.IMPORT,
    userId
  );

  // Queue the job for processing
  await this.importQueue.add('process-import', {
    jobId: job.id,
    projectId,
    // ... other data
  });

  return job;
}
```

### Updating Job Progress

```typescript
// In your processor
async processImport(jobId: string) {
  // Update to running
  await this.jobsService.updateJobStatus(jobId, JobStatus.RUNNING, 0);

  // Update progress
  await this.jobsService.updateJobStatus(jobId, JobStatus.RUNNING, 50);

  // Complete with result
  await this.jobsService.updateJobStatus(jobId, JobStatus.COMPLETED, 100);
  await this.jobsService.updateJobResult(jobId, {
    recordsProcessed: 100,
    recordsCreated: 95
  });
}
```

### Handling Errors

```typescript
try {
  // Process job
} catch (error) {
  await this.jobsService.updateJobError(jobId, error.message);
}
```

## BullMQ Integration

The Jobs module registers the following BullMQ queues:
- `import`: Import job processing
- `export`: Export job processing
- `validation`: Validation job processing
- `tests`: Test execution job processing

Each queue is configured with Redis connection from the application configuration.

## Data Model

### Job Entity

```typescript
{
  id: UUID
  type: enum (Import, Export, Validation, TestRun)
  projectId: UUID (Project)
  status: enum (Queued, Running, Completed, Failed, Cancelled)
  progress: number (0-100)
  result: JSONB (job-specific result data)
  error: string (error message if failed)
  createdAt: timestamp
  startedAt: timestamp
  completedAt: timestamp
  createdBy: UUID (User)
}
```

## Requirements Validation

This module validates the following requirements:

- **Requirement 25.1**: Execute imports, exports, validation runs, and test runs as asynchronous background jobs
- **Requirement 25.2**: Return job ID and initial status when job is submitted
- **Requirement 25.3**: Provide jobs dashboard showing active, completed, and failed jobs with progress percentage
- **Requirement 25.5**: Record error details and allow retry when job fails
- **Requirement 25.6**: Allow canceling running jobs

## Testing

Unit tests are located in `jobs.service.spec.ts` and cover:
- Job creation
- Status updates
- Progress tracking
- Job cancellation
- Job retry
- Statistics calculation
- Error handling
