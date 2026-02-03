import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
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
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentResponseDto } from './dto/equipment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../projects/guards/project-access.guard';
import { ProjectContext } from '../projects/decorators/project-context.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuditInterceptor } from '../audit/audit.interceptor';

@ApiTags('Equipment')
@ApiBearerAuth()
@Controller('api/projects/:projectId/equipment')
@UseGuards(JwtAuthGuard, ProjectAccessGuard)
@UseInterceptors(AuditInterceptor)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create new equipment' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 201,
    description: 'Equipment created successfully',
    type: EquipmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @ProjectContext() projectId: string,
    @Body() createEquipmentDto: CreateEquipmentDto,
    @CurrentUser() user: any,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.create(
      projectId,
      createEquipmentDto,
      user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all equipment in a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Equipment retrieved successfully',
    type: [EquipmentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @ProjectContext() projectId: string,
  ): Promise<EquipmentResponseDto[]> {
    return this.equipmentService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  @ApiResponse({
    status: 200,
    description: 'Equipment retrieved successfully',
    type: EquipmentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  async findOne(
    @Param('id') id: string,
    @ProjectContext() projectId: string,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.findOne(id, projectId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update equipment' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  @ApiResponse({
    status: 200,
    description: 'Equipment updated successfully',
    type: EquipmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  async update(
    @Param('id') id: string,
    @ProjectContext() projectId: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.update(id, projectId, updateEquipmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete equipment' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Equipment ID' })
  @ApiResponse({ status: 204, description: 'Equipment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  async remove(
    @Param('id') id: string,
    @ProjectContext() projectId: string,
  ): Promise<void> {
    return this.equipmentService.remove(id, projectId);
  }
}
