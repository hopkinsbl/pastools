import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectRolesService } from './project-roles.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProjectRoleType } from '../entities/project-role.entity';

@ApiTags('Project Roles')
@Controller('api/projects/:projectId/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProjectRolesController {
  constructor(private readonly projectRolesService: ProjectRolesService) {}

  @Post()
  @Roles(ProjectRoleType.ADMIN)
  @ApiOperation({ summary: 'Assign a role to a user in a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 201,
    description: 'Role successfully assigned',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Project or user not found' })
  @ApiResponse({ status: 409, description: 'User already has a role in this project' })
  async assignRole(
    @Param('projectId') projectId: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.projectRolesService.assignRole(projectId, assignRoleDto);
  }

  @Put(':userId')
  @Roles(ProjectRoleType.ADMIN)
  @ApiOperation({ summary: 'Update a user\'s role in a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Role successfully updated',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User role not found' })
  async updateRole(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.projectRolesService.updateRole(projectId, userId, updateRoleDto);
  }

  @Delete(':userId')
  @Roles(ProjectRoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a user\'s role from a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'Role successfully removed',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User role not found' })
  async removeRole(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    await this.projectRolesService.removeRole(projectId, userId);
  }

  @Get()
  @Roles(ProjectRoleType.ADMIN, ProjectRoleType.ENGINEER, ProjectRoleType.VIEWER, ProjectRoleType.APPROVER)
  @ApiOperation({ summary: 'Get all roles for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'List of project roles',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Project access required' })
  async getProjectRoles(@Param('projectId') projectId: string) {
    return this.projectRolesService.getProjectRoles(projectId);
  }

  @Get(':userId')
  @Roles(ProjectRoleType.ADMIN, ProjectRoleType.ENGINEER, ProjectRoleType.VIEWER, ProjectRoleType.APPROVER)
  @ApiOperation({ summary: 'Get a specific user\'s role in a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User role information',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Project access required' })
  @ApiResponse({ status: 404, description: 'User role not found' })
  async getUserRole(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.projectRolesService.getUserRole(projectId, userId);
  }
}
