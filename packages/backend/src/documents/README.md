# Documents Module

## Purpose

The Documents module manages engineering documents within industrial control system projects. Documents represent technical documentation such as P&IDs, specifications, procedures, and other project-related files.

## Features

- CRUD operations for documents scoped to projects
- Document type and version tracking
- Link documents to files via fileId
- Flexible metadata storage
- Automatic audit logging
- Project-level data isolation

## API Endpoints

### Create Document
```
POST /api/projects/:projectId/documents
```

Creates a new document in the specified project.

**Request Body:**
```json
{
  "title": "P&ID Drawing - Reactor Section",
  "type": "P&ID",
  "version": "Rev 3.2",
  "fileId": "123e4567-e89b-12d3-a456-426614174000",
  "metadata": {
    "author": "John Doe",
    "department": "Engineering",
    "approvalDate": "2024-01-15"
  }
}
```

**Response:** `DocumentResponseDto` (201 Created)

### Get All Documents
```
GET /api/projects/:projectId/documents
```

Retrieves all documents in the specified project.

**Response:** `DocumentResponseDto[]` (200 OK)

### Get Document by ID
```
GET /api/projects/:projectId/documents/:id
```

Retrieves a specific document by ID within the project.

**Response:** `DocumentResponseDto` (200 OK)

### Update Document
```
PUT /api/projects/:projectId/documents/:id
```

Updates an existing document. All fields are optional.

**Request Body:** `UpdateDocumentDto` (partial)

**Response:** `DocumentResponseDto` (200 OK)

### Delete Document
```
DELETE /api/projects/:projectId/documents/:id
```

Deletes a document from the project.

**Response:** 204 No Content

## Data Model

### Document Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| projectId | UUID | Parent project ID |
| title | string | Document title |
| type | string | Document type (optional) |
| version | string | Document version (optional) |
| fileId | UUID | File reference (optional) |
| metadata | JSONB | Additional metadata (optional) |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |
| createdBy | UUID | User who created the document |

### Common Document Types

- **P&ID** - Piping and Instrumentation Diagram
- **PFD** - Process Flow Diagram
- **Specification** - Technical specification document
- **Procedure** - Operating or maintenance procedure
- **Manual** - Equipment or system manual
- **Drawing** - Engineering drawing
- **Report** - Test report, commissioning report, etc.
- **Certificate** - Calibration certificate, test certificate, etc.

## Requirements Validation

This module validates **Requirement 2.4**:

> THE System SHALL store documents with title, type, version, metadata, and file attachment references

## Usage Examples

### Creating a Document

```typescript
const document = await documentsService.create(
  projectId,
  {
    title: 'P&ID Drawing - Reactor Section',
    type: 'P&ID',
    version: 'Rev 3.2',
    fileId: 'file-uuid',
    metadata: {
      author: 'John Doe',
      department: 'Engineering',
    },
  },
  userId
);
```

### Querying Documents

```typescript
// Get all documents in a project
const documents = await documentsService.findAll(projectId);

// Get a specific document
const document = await documentsService.findOne(documentId, projectId);
```

### Updating a Document

```typescript
const updated = await documentsService.update(
  documentId,
  projectId,
  {
    version: 'Rev 3.3',
    metadata: {
      ...existing.metadata,
      revisionDate: '2024-02-01',
    },
  }
);
```

### Linking to Files

Documents can reference files stored in the file storage system:

```typescript
// First upload a file
const file = await storageService.upload(fileData, userId);

// Then create a document referencing the file
const document = await documentsService.create(
  projectId,
  {
    title: 'Equipment Manual',
    type: 'Manual',
    fileId: file.id,
  },
  userId
);
```

## Integration with File Storage

The `fileId` field links documents to files in the storage system. This allows:
- Storing document metadata separately from file content
- Multiple document records can reference the same file
- Document versioning without duplicating files
- Querying documents without loading file content

To download a document's file:
```typescript
const document = await documentsService.findOne(documentId, projectId);
if (document.fileId) {
  const downloadUrl = await storageService.getDownloadUrl(document.fileId);
  // Use downloadUrl to download the file
}
```

## Security

- All endpoints require JWT authentication
- Project access is validated via `ProjectAccessGuard`
- Documents are automatically scoped to projects
- Users can only access documents in projects they have access to
- All operations are logged via `AuditInterceptor`
- File access is controlled through the storage module

## Testing

Unit tests should cover:
- Document creation with and without file references
- Document retrieval and filtering
- Document updates
- Document deletion
- Project isolation (documents from other projects not accessible)
- Validation of required fields
- Error handling for not found scenarios
- File reference validation
