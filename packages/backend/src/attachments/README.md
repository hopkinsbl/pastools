# Attachments Module

## Purpose

The Attachments module provides universal file attachment capabilities for any entity in the PAStools platform. It allows users to attach files (documents, images, evidence, etc.) to tags, equipment, alarms, technical queries, punchlist items, and any other entity type.

## Features

- Attach files to any entity type
- Support for attachment descriptions
- Query attachments by entity
- Audit logging of attachment operations
- User attribution for attachments

## API Endpoints

### Create Attachment

```
POST /attachments
```

Attach a file to an entity.

**Request Body:**
```json
{
  "entityType": "tag",
  "entityId": "123e4567-e89b-12d3-a456-426614174000",
  "fileId": "123e4567-e89b-12d3-a456-426614174001",
  "description": "Equipment specification document"
}
```

**Response:** `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "entityType": "tag",
  "entityId": "123e4567-e89b-12d3-a456-426614174000",
  "fileId": "123e4567-e89b-12d3-a456-426614174001",
  "file": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "filename": "spec.pdf",
    "contentType": "application/pdf",
    "size": 1024000,
    "uploadedAt": "2024-01-15T10:30:00Z"
  },
  "description": "Equipment specification document",
  "createdAt": "2024-01-15T10:30:00Z",
  "createdBy": "user-id"
}
```

### Get Entity Attachments

```
GET /attachments/entity/:entityType/:entityId
```

Retrieve all attachments for a specific entity.

**Parameters:**
- `entityType`: Type of entity (e.g., "tag", "equipment", "alarm")
- `entityId`: UUID of the entity

**Response:** `200 OK`
```json
[
  {
    "id": "attachment-id",
    "entityType": "tag",
    "entityId": "entity-id",
    "fileId": "file-id",
    "file": { ... },
    "description": "Description",
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "user-id"
  }
]
```

### Get Attachment

```
GET /attachments/:id
```

Retrieve a specific attachment by ID.

**Response:** `200 OK` - Attachment details

### Delete Attachment

```
DELETE /attachments/:id
```

Remove an attachment. Note: This does not delete the underlying file, only the attachment link.

**Response:** `204 No Content`

## Data Model

### Attachment Entity

```typescript
{
  id: UUID
  entityType: string          // Type of entity (tag, equipment, etc.)
  entityId: UUID              // ID of the entity
  fileId: UUID                // Reference to File entity
  description: string         // Optional description
  createdAt: timestamp
  createdBy: UUID (User)
}
```

## Usage Examples

### Attaching a File to a Tag

1. First, upload the file using the Storage module:
```typescript
POST /storage/upload-url
{
  "filename": "datasheet.pdf",
  "contentType": "application/pdf",
  "size": 1024000
}
```

2. Upload the file to the presigned URL (client-side)

3. Create the attachment:
```typescript
POST /attachments
{
  "entityType": "tag",
  "entityId": "tag-uuid",
  "fileId": "file-uuid-from-step-1",
  "description": "Manufacturer datasheet"
}
```

### Retrieving Attachments for an Entity

```typescript
GET /attachments/entity/tag/tag-uuid
```

Returns all attachments for the specified tag.

## Requirements Validation

This module validates the following requirements:

- **Requirement 3.2**: Allow attaching files to any CDM entity
- **Requirement 3.3**: Store attachment description
- **Requirement 3.4**: Display attachments when viewing an entity

## Integration

The Attachments module integrates with:

- **Storage Module**: For file upload and management
- **Audit Module**: For tracking attachment operations
- **Auth Module**: For user authentication and attribution

## Security

- All endpoints require JWT authentication
- User attribution is automatically added to attachments
- Audit logs track all attachment create/delete operations

## Future Enhancements

- Authorization checks (only creator or admin can delete)
- Attachment versioning
- Bulk attachment operations
- Attachment search and filtering
