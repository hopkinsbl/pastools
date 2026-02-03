# Tags Module

## Purpose

The Tags module manages industrial control system tags (signals and control points) within projects. Tags represent various types of process signals including analog inputs/outputs, digital inputs/outputs, PID controllers, valves, drives, totalisers, and calculated values.

## Features

- CRUD operations for tags scoped to projects
- Support for 9 tag types: AI, AO, DI, DO, PID, Valve, Drive, Totaliser, Calc
- Engineering units and scaling configuration
- Flexible metadata storage
- Import lineage tracking
- Automatic audit logging
- Project-level data isolation

## API Endpoints

### Create Tag
```
POST /api/projects/:projectId/tags
```

Creates a new tag in the specified project.

**Request Body:**
```json
{
  "type": "AI",
  "name": "FT-101",
  "description": "Flow transmitter for reactor inlet",
  "engineeringUnits": "m3/h",
  "scaleLow": 0,
  "scaleHigh": 100,
  "metadata": {
    "location": "Building A",
    "system": "Cooling"
  },
  "importLineage": {
    "sourceFile": "tags_export.xlsx",
    "sheetName": "AI Tags",
    "rowNumber": 42
  }
}
```

**Response:** `TagResponseDto` (201 Created)

### Get All Tags
```
GET /api/projects/:projectId/tags
```

Retrieves all tags in the specified project.

**Response:** `TagResponseDto[]` (200 OK)

### Get Tag by ID
```
GET /api/projects/:projectId/tags/:id
```

Retrieves a specific tag by ID within the project.

**Response:** `TagResponseDto` (200 OK)

### Update Tag
```
PUT /api/projects/:projectId/tags/:id
```

Updates an existing tag. All fields are optional.

**Request Body:** `UpdateTagDto` (partial)

**Response:** `TagResponseDto` (200 OK)

### Delete Tag
```
DELETE /api/projects/:projectId/tags/:id
```

Deletes a tag from the project.

**Response:** 204 No Content

## Data Model

### Tag Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| projectId | UUID | Parent project ID |
| type | TagType | Tag type (AI/AO/DI/DO/PID/Valve/Drive/Totaliser/Calc) |
| name | string | Tag name/identifier |
| description | string | Tag description (optional) |
| engineeringUnits | string | Engineering units (optional) |
| scaleLow | number | Low scale value (optional) |
| scaleHigh | number | High scale value (optional) |
| metadata | JSONB | Additional metadata (optional) |
| importLineage | JSONB | Import source tracking (optional) |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |
| createdBy | UUID | User who created the tag |

### Tag Types

- **AI** - Analog Input (e.g., temperature, pressure, flow sensors)
- **AO** - Analog Output (e.g., control valve position, motor speed)
- **DI** - Digital Input (e.g., limit switches, status indicators)
- **DO** - Digital Output (e.g., pump start/stop, valve open/close)
- **PID** - PID Controller (e.g., temperature controller, level controller)
- **Valve** - Control Valve (e.g., modulating valve, on/off valve)
- **Drive** - Variable Frequency Drive (e.g., motor speed control)
- **Totaliser** - Totalizer/Integrator (e.g., flow totalizer, energy meter)
- **Calc** - Calculated Value (e.g., derived measurements, computed values)

## Requirements Validation

This module validates **Requirement 2.1**:

> THE System SHALL store tags with type (AI/AO/DI/DO/PID/Valve/Drive/Totaliser/Calc), name, description, engineering units, scaling, and metadata

## Usage Examples

### Creating a Tag

```typescript
const tag = await tagsService.create(
  projectId,
  {
    type: TagType.AI,
    name: 'FT-101',
    description: 'Flow transmitter for reactor inlet',
    engineeringUnits: 'm3/h',
    scaleLow: 0,
    scaleHigh: 100,
  },
  userId
);
```

### Querying Tags

```typescript
// Get all tags in a project
const tags = await tagsService.findAll(projectId);

// Get a specific tag
const tag = await tagsService.findOne(tagId, projectId);
```

### Updating a Tag

```typescript
const updatedTag = await tagsService.update(
  tagId,
  projectId,
  {
    description: 'Updated description',
    scaleHigh: 150,
  }
);
```

## Security

- All endpoints require JWT authentication
- Project access is validated via `ProjectAccessGuard`
- Tags are automatically scoped to projects
- Users can only access tags in projects they have access to
- All operations are logged via `AuditInterceptor`

## Testing

Unit tests should cover:
- Tag creation with all tag types
- Tag retrieval and filtering
- Tag updates
- Tag deletion
- Project isolation (tags from other projects not accessible)
- Validation of required fields
- Error handling for not found scenarios
