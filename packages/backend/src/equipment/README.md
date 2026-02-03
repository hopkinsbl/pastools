# Equipment Module

## Purpose

The Equipment module manages physical and logical equipment items within industrial control system projects. Equipment represents plant assets such as pumps, vessels, heat exchangers, motors, and other process equipment.

## Features

- CRUD operations for equipment scoped to projects
- Equipment type and location tracking
- Flexible metadata storage
- Import lineage tracking
- Automatic audit logging
- Project-level data isolation

## API Endpoints

### Create Equipment
```
POST /api/projects/:projectId/equipment
```

Creates new equipment in the specified project.

**Request Body:**
```json
{
  "name": "P-101",
  "description": "Reactor feed pump",
  "type": "Centrifugal Pump",
  "location": "Building A, Level 2",
  "metadata": {
    "manufacturer": "ACME Corp",
    "model": "XYZ-500",
    "serialNumber": "SN-12345"
  },
  "importLineage": {
    "sourceFile": "equipment_list.xlsx",
    "sheetName": "Pumps",
    "rowNumber": 15
  }
}
```

**Response:** `EquipmentResponseDto` (201 Created)

### Get All Equipment
```
GET /api/projects/:projectId/equipment
```

Retrieves all equipment in the specified project.

**Response:** `EquipmentResponseDto[]` (200 OK)

### Get Equipment by ID
```
GET /api/projects/:projectId/equipment/:id
```

Retrieves specific equipment by ID within the project.

**Response:** `EquipmentResponseDto` (200 OK)

### Update Equipment
```
PUT /api/projects/:projectId/equipment/:id
```

Updates existing equipment. All fields are optional.

**Request Body:** `UpdateEquipmentDto` (partial)

**Response:** `EquipmentResponseDto` (200 OK)

### Delete Equipment
```
DELETE /api/projects/:projectId/equipment/:id
```

Deletes equipment from the project.

**Response:** 204 No Content

## Data Model

### Equipment Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| projectId | UUID | Parent project ID |
| name | string | Equipment name/identifier |
| description | string | Equipment description (optional) |
| type | string | Equipment type (optional) |
| location | string | Physical location (optional) |
| metadata | JSONB | Additional metadata (optional) |
| importLineage | JSONB | Import source tracking (optional) |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |
| createdBy | UUID | User who created the equipment |

## Requirements Validation

This module validates **Requirement 2.2**:

> THE System SHALL store equipment with name, description, type, location, and metadata

## Usage Examples

### Creating Equipment

```typescript
const equipment = await equipmentService.create(
  projectId,
  {
    name: 'P-101',
    description: 'Reactor feed pump',
    type: 'Centrifugal Pump',
    location: 'Building A, Level 2',
    metadata: {
      manufacturer: 'ACME Corp',
      model: 'XYZ-500',
    },
  },
  userId
);
```

### Querying Equipment

```typescript
// Get all equipment in a project
const equipment = await equipmentService.findAll(projectId);

// Get specific equipment
const item = await equipmentService.findOne(equipmentId, projectId);
```

### Updating Equipment

```typescript
const updated = await equipmentService.update(
  equipmentId,
  projectId,
  {
    location: 'Building B, Level 1',
    metadata: {
      ...existing.metadata,
      lastMaintenance: '2024-01-15',
    },
  }
);
```

## Security

- All endpoints require JWT authentication
- Project access is validated via `ProjectAccessGuard`
- Equipment is automatically scoped to projects
- Users can only access equipment in projects they have access to
- All operations are logged via `AuditInterceptor`

## Testing

Unit tests should cover:
- Equipment creation
- Equipment retrieval and filtering
- Equipment updates
- Equipment deletion
- Project isolation (equipment from other projects not accessible)
- Validation of required fields
- Error handling for not found scenarios
