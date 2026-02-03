# Projects Module

This module provides project management functionality and project-scoped data isolation for the PAStools platform.

## Features

### 1. Project CRUD Operations

The `ProjectsService` provides standard CRUD operations for projects:

- `create(dto, userId)` - Create a new project
- `findAll(userId)` - List all projects (filtered by user access)
- `findOne(id, userId)` - Get a specific project
- `update(id, dto, userId)` - Update a project
- `remove(id, userId)` - Delete a project

### 2. Project Context and Data Isolation

All CDM entities (tags, equipment, alarms, etc.) are scoped to a specific project. This module provides utilities to enforce project isolation:

#### BaseProjectScopedService

A base service class that all entity services should extend to automatically enforce project scoping:

```typescript
@Injectable()
export class TagsService extends BaseProjectScopedService<Tag> {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {
    super(tagRepository);
  }

  async findAll(projectId: string): Promise<Tag[]> {
    return this.findAllInProject(projectId);
  }

  async findOne(id: string, projectId: string): Promise<Tag> {
    return this.findOneInProject(id, projectId);
  }

  async create(projectId: string, data: CreateTagDto, userId: string): Promise<Tag> {
    return this.createInProject(projectId, data, userId);
  }

  async update(id: string, projectId: string, data: UpdateTagDto): Promise<Tag> {
    return this.updateInProject(id, projectId, data);
  }

  async remove(id: string, projectId: string): Promise<void> {
    return this.deleteInProject(id, projectId);
  }
}
```

The base service provides these protected methods:

- `findAllInProject(projectId, options?)` - Find all entities in a project
- `findOneInProject(id, projectId)` - Find one entity by ID in a project
- `createInProject(projectId, data, userId)` - Create an entity in a project
- `updateInProject(id, projectId, data)` - Update an entity in a project
- `deleteInProject(id, projectId)` - Delete an entity in a project
- `countInProject(projectId, options?)` - Count entities in a project

#### ProjectContext Decorator

Extract the project ID from the request:

```typescript
@Get()
async findAll(@ProjectContext() projectId: string): Promise<Tag[]> {
  return this.tagsService.findAll(projectId);
}
```

The decorator looks for `projectId` in:
1. Route params (`/api/projects/:projectId/tags`)
2. Query params (`/api/tags?projectId=xxx`)
3. Request body

#### ProjectAccessGuard

Validates that:
1. The project exists
2. The user has access to the project

```typescript
@Controller('api/projects/:projectId/tags')
@UseGuards(JwtAuthGuard, ProjectAccessGuard)
export class TagsController {
  // All routes here will validate project access
}
```

## API Routes

### Projects

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Project-Scoped Entities

All entity routes should follow this pattern:

- `GET /api/projects/:projectId/tags` - List tags in a project
- `POST /api/projects/:projectId/tags` - Create a tag in a project
- `GET /api/projects/:projectId/tags/:id` - Get a tag in a project
- `PUT /api/projects/:projectId/tags/:id` - Update a tag in a project
- `DELETE /api/projects/:projectId/tags/:id` - Delete a tag in a project

## Data Model

### Project Entity

```typescript
{
  id: UUID
  name: string
  description: string | null
  metadata: Record<string, any> | null
  createdAt: Date
  updatedAt: Date
  createdBy: UUID (User)
}
```

The `metadata` field can store project-level configuration including:
- Validation rules
- Import profiles
- Custom settings

## Requirements Validation

This module implements:

- **Requirement 1.1**: Project creation and management
- **Requirement 1.2**: Project context and data isolation
- **Requirement 1.3**: Project switcher interface (frontend)
- **Requirement 1.4**: Project-level configuration storage

## Testing

Property-based tests validate:

- **Property 2**: Project Data Isolation - Entities are scoped to their project
- **Property 3**: Configuration Round Trip - Project configuration is preserved

## Usage Example

### Creating a Project-Scoped Controller

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../projects/guards/project-access.guard';
import { ProjectContext } from '../projects/decorators/project-context.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/projects/:projectId/tags')
@UseGuards(JwtAuthGuard, ProjectAccessGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async findAll(@ProjectContext() projectId: string): Promise<Tag[]> {
    return this.tagsService.findAll(projectId);
  }

  @Post()
  async create(
    @ProjectContext() projectId: string,
    @Body() createTagDto: CreateTagDto,
    @CurrentUser() user: any,
  ): Promise<Tag> {
    return this.tagsService.create(projectId, createTagDto, user.userId);
  }
}
```

This ensures:
1. User is authenticated (JwtAuthGuard)
2. Project exists and user has access (ProjectAccessGuard)
3. All operations are scoped to the project (ProjectContext + BaseProjectScopedService)
