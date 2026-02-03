# Audit Module

The Audit Module provides comprehensive audit logging for all create, update, delete, link, and unlink operations in the PAStools platform.

## Features

- Automatic audit logging via interceptor
- Query audit logs with flexible filtering
- Support for all CRUD operations plus link/unlink
- Immutable audit trail (logs cannot be modified or deleted)

## Usage

### Applying Audit Logging to Controllers

Apply the `AuditInterceptor` to any controller or method that should be audited:

```typescript
import { Controller, UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from '../audit/audit.interceptor';

@Controller('tags')
@UseInterceptors(AuditInterceptor)
export class TagsController {
  // All methods in this controller will be audited
}
```

### Auditing Link Operations

For link/unlink operations, use the `@AuditLink` decorator:

```typescript
import { Controller, Post, Delete, UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { AuditLink } from '../audit/decorators/audit-link.decorator';

@Controller('links')
@UseInterceptors(AuditInterceptor)
export class LinksController {
  @Post()
  @AuditLink('link')
  createLink() {
    // This will be logged as a LINK operation
  }

  @Delete(':id')
  @AuditLink('unlink')
  deleteLink() {
    // This will be logged as an UNLINK operation
  }
}
```

### Querying Audit Logs

Query audit logs via the REST API:

```bash
# Get all audit logs
GET /api/audit

# Filter by user
GET /api/audit?userId=123e4567-e89b-12d3-a456-426614174000

# Filter by entity type
GET /api/audit?entityType=tag

# Filter by operation
GET /api/audit?operation=Create

# Filter by date range
GET /api/audit?startDate=2024-01-01&endDate=2024-12-31

# Combine filters with pagination
GET /api/audit?entityType=tag&operation=Update&limit=50&offset=0
```

### Programmatic Access

Use the `AuditService` directly in your code:

```typescript
import { AuditService } from '../audit/audit.service';
import { AuditOperation } from '../entities/audit-log.entity';

@Injectable()
export class MyService {
  constructor(private readonly auditService: AuditService) {}

  async doSomething() {
    // Create audit log manually
    await this.auditService.createAuditLog(
      userId,
      AuditOperation.CREATE,
      'tag',
      tagId,
      { name: 'AI-001', description: 'Temperature sensor' }
    );

    // Query audit logs
    const result = await this.auditService.queryAuditLogs({
      entityType: 'tag',
      operation: AuditOperation.UPDATE,
      limit: 10
    });
  }
}
```

## How It Works

1. **Interceptor**: The `AuditInterceptor` intercepts all HTTP requests
2. **User Extraction**: Extracts the authenticated user from the request
3. **Operation Detection**: Determines the operation type from HTTP method or decorator
4. **Entity Extraction**: Extracts entity type from the route path and entity ID from response
5. **Logging**: Creates an audit log entry with user, timestamp, operation, entity info, and changes
6. **Non-Blocking**: Audit logging failures don't affect the main request

## Audit Log Structure

Each audit log entry contains:

- `id`: Unique identifier
- `userId`: User who performed the operation
- `operation`: Type of operation (Create, Update, Delete, Link, Unlink)
- `entityType`: Type of entity affected (tag, equipment, alarm, etc.)
- `entityId`: ID of the affected entity
- `changes`: JSONB field containing the changes (for create/update/link operations)
- `timestamp`: When the operation occurred

## Requirements Validation

This module validates the following requirements:

- **Requirement 5.1**: Records audit log for all entity create operations
- **Requirement 5.2**: Records audit log for all entity update operations with changed fields
- **Requirement 5.3**: Records audit log for all link create/delete operations
- **Requirement 5.4**: Provides audit log query API with filtering
- **Requirement 5.5**: Audit logs are immutable (no update/delete endpoints provided)

## Correctness Properties

- **Property 10**: Comprehensive Audit Logging - All operations are logged
- **Property 11**: Audit Log Filtering - Query results match all specified filters
- **Property 12**: Audit Log Immutability - Logs cannot be modified or deleted
