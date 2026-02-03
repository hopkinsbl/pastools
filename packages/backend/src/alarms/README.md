# Alarms Module

## Purpose

The Alarms module manages alarm configurations for industrial control system tags. Alarms represent alert conditions with rationalization fields including priority, setpoint, consequence, and required operator actions.

## Features

- CRUD operations for alarms scoped to projects
- Link alarms to tags
- Support for 4 priority levels: Critical, High, Medium, Low
- Alarm rationalization fields (consequence, operator action)
- Flexible metadata storage
- Import lineage tracking
- Automatic audit logging
- Project-level data isolation

## API Endpoints

### Create Alarm
```
POST /api/projects/:projectId/alarms
```

Creates a new alarm in the specified project.

**Request Body:**
```json
{
  "tagId": "123e4567-e89b-12d3-a456-426614174000",
  "priority": "High",
  "setpoint": 85.5,
  "rationalization": "High temperature alarm to prevent equipment damage",
  "consequence": "Equipment overheating and potential failure",
  "operatorAction": "Reduce feed rate and check cooling system",
  "metadata": {
    "alarmType": "High",
    "deadband": 2.0
  },
  "importLineage": {
    "sourceFile": "alarms_export.xlsx",
    "sheetName": "Temperature Alarms",
    "rowNumber": 23
  }
}
```

**Response:** `AlarmResponseDto` (201 Created)

### Get All Alarms
```
GET /api/projects/:projectId/alarms
```

Retrieves all alarms in the specified project.

**Response:** `AlarmResponseDto[]` (200 OK)

### Get Alarm by ID
```
GET /api/projects/:projectId/alarms/:id
```

Retrieves a specific alarm by ID within the project.

**Response:** `AlarmResponseDto` (200 OK)

### Update Alarm
```
PUT /api/projects/:projectId/alarms/:id
```

Updates an existing alarm. All fields are optional.

**Request Body:** `UpdateAlarmDto` (partial)

**Response:** `AlarmResponseDto` (200 OK)

### Delete Alarm
```
DELETE /api/projects/:projectId/alarms/:id
```

Deletes an alarm from the project.

**Response:** 204 No Content

## Data Model

### Alarm Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| projectId | UUID | Parent project ID |
| tagId | UUID | Associated tag ID |
| priority | AlarmPriority | Alarm priority (Critical/High/Medium/Low) |
| setpoint | number | Alarm setpoint value (optional) |
| rationalization | string | Alarm rationalization (optional) |
| consequence | string | Consequence if not addressed (optional) |
| operatorAction | string | Required operator action (optional) |
| metadata | JSONB | Additional metadata (optional) |
| importLineage | JSONB | Import source tracking (optional) |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |
| createdBy | UUID | User who created the alarm |

### Alarm Priorities

- **Critical** - Immediate action required, safety or equipment protection
- **High** - Urgent attention needed, potential for significant impact
- **Medium** - Timely response required, moderate impact
- **Low** - Informational, minimal impact

## Requirements Validation

This module validates **Requirement 2.3**:

> THE System SHALL store alarms with tag reference, priority, setpoint, rationalization fields, and metadata

## Usage Examples

### Creating an Alarm

```typescript
const alarm = await alarmsService.create(
  projectId,
  {
    tagId: 'tag-uuid',
    priority: AlarmPriority.HIGH,
    setpoint: 85.5,
    rationalization: 'High temperature alarm to prevent equipment damage',
    consequence: 'Equipment overheating and potential failure',
    operatorAction: 'Reduce feed rate and check cooling system',
  },
  userId
);
```

### Querying Alarms

```typescript
// Get all alarms in a project
const alarms = await alarmsService.findAll(projectId);

// Get a specific alarm
const alarm = await alarmsService.findOne(alarmId, projectId);
```

### Updating an Alarm

```typescript
const updatedAlarm = await alarmsService.update(
  alarmId,
  projectId,
  {
    setpoint: 90.0,
    operatorAction: 'Updated action: Shut down feed pump immediately',
  }
);
```

## Alarm Rationalization

Alarm rationalization is a critical process in industrial control systems to ensure alarms are:
- **Necessary**: Each alarm serves a clear purpose
- **Unique**: No duplicate or redundant alarms
- **Prioritized**: Correct priority assignment
- **Understandable**: Clear consequence and operator action
- **Manageable**: Operators can respond effectively

The rationalization fields in this module support this process:
- **Rationalization**: Why this alarm exists
- **Consequence**: What happens if not addressed
- **Operator Action**: What the operator should do

## Security

- All endpoints require JWT authentication
- Project access is validated via `ProjectAccessGuard`
- Alarms are automatically scoped to projects
- Users can only access alarms in projects they have access to
- All operations are logged via `AuditInterceptor`

## Testing

Unit tests should cover:
- Alarm creation with all priority levels
- Alarm retrieval and filtering
- Alarm updates
- Alarm deletion
- Tag association validation
- Project isolation (alarms from other projects not accessible)
- Validation of required fields
- Error handling for not found scenarios
