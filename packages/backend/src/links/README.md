# Links Module

## Overview

The Links module provides universal entity linking functionality, allowing any CDM entity to be linked to any other entity with optional link type and description.

## Features

- Create links between any two entities
- Query all links for a specific entity
- Delete links
- Check if an entity has active links (for deletion protection)
- Audit logging for link creation and deletion

## API Endpoints

### Create Link

```
POST /api/links
```

Creates a new link between two entities.

**Request Body:**
```json
{
  "sourceEntityType": "tag",
  "sourceEntityId": "123e4567-e89b-12d3-a456-426614174000",
  "targetEntityType": "equipment",
  "targetEntityId": "987fcdeb-51a2-43f7-b123-456789abcdef",
  "linkType": "monitors",
  "description": "This tag monitors this equipment"
}
```

**Response:** `201 Created`
```json
{
  "id": "abc12345-e89b-12d3-a456-426614174000",
  "sourceEntityType": "tag",
  "sourceEntityId": "123e4567-e89b-12d3-a456-426614174000",
  "targetEntityType": "equipment",
  "targetEntityId": "987fcdeb-51a2-43f7-b123-456789abcdef",
  "linkType": "monitors",
  "description": "This tag monitors this equipment",
  "createdAt": "2024-01-15T10:30:00Z",
  "createdBy": "user-uuid"
}
```

### Get Entity Links

```
GET /api/entities/:entityType/:entityId/links
```

Retrieves all links for a specific entity (both as source and target).

**Parameters:**
- `entityType`: Type of entity (e.g., "tag", "equipment", "alarm")
- `entityId`: UUID of the entity

**Response:** `200 OK`
```json
[
  {
    "id": "abc12345-e89b-12d3-a456-426614174000",
    "sourceEntityType": "tag",
    "sourceEntityId": "123e4567-e89b-12d3-a456-426614174000",
    "targetEntityType": "equipment",
    "targetEntityId": "987fcdeb-51a2-43f7-b123-456789abcdef",
    "linkType": "monitors",
    "description": "This tag monitors this equipment",
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "user-uuid"
  }
]
```

### Get Link by ID

```
GET /api/links/:id
```

Retrieves a specific link by its ID.

**Response:** `200 OK` (same structure as create response)

### Delete Link

```
DELETE /api/links/:id
```

Deletes a link.

**Response:** `200 OK`
```json
{
  "message": "Link deleted successfully"
}
```

## Data Model

### Link Entity

```typescript
{
  id: UUID
  sourceEntityType: string
  sourceEntityId: UUID
  targetEntityType: string
  targetEntityId: UUID
  linkType: string (optional)
  description: string (optional)
  createdAt: timestamp
  createdBy: UUID (User)
}
```

## Usage Examples

### Creating a Link Between Tag and Equipment

```typescript
const link = await linksService.create({
  sourceEntityType: 'tag',
  sourceEntityId: tagId,
  targetEntityType: 'equipment',
  targetEntityId: equipmentId,
  linkType: 'monitors',
  description: 'Temperature sensor for reactor vessel'
}, userId);
```

### Getting All Links for an Entity

```typescript
const links = await linksService.findByEntity('tag', tagId);
```

### Checking if Entity Has Links (for deletion protection)

```typescript
const hasLinks = await linksService.hasLinks('equipment', equipmentId);
if (hasLinks) {
  // Require confirmation before deletion
}
```

## Requirements Validation

This module validates the following requirements:

- **Requirement 3.1**: Allow creating links between any two CDM entities with link type and description
- **Requirement 3.4**: Display all linked entities when viewing an entity
- **Requirement 3.5**: Prevent deletion of entities with active links without confirmation

## Audit Logging

All link operations are automatically logged through the AuditInterceptor:
- Link creation: Logged with operation "link"
- Link deletion: Logged with operation "unlink"

## Database Indexes

The Link entity has composite indexes on:
- `(sourceEntityType, sourceEntityId)` - for efficient source entity queries
- `(targetEntityType, targetEntityId)` - for efficient target entity queries

## Integration

The LinksService is exported and can be injected into other modules to:
- Check for active links before entity deletion
- Include link counts in entity responses
- Implement cascading link deletion
