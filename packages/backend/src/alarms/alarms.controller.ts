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
import { AlarmsService } from './alarms.service';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { UpdateAlarmDto } from './dto/update-alarm.dto';
import { AlarmResponseDto } from './dto/alarm-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../projects/guards/project-access.guard';
import { ProjectContext } from '../projects/decorators/project-context.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuditInterceptor } from '../audit/audit.interceptor';

@ApiTags('Alarms')
@ApiBearerAuth()
@Controller('api/projects/:projectId/alarms')
@UseGuards(JwtAuthGuard, ProjectAccessGuard)
@UseInterceptors(AuditInterceptor)
export class AlarmsController {
  constructor(private readonly alarmsService: AlarmsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new alarm' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 201,
    description: 'Alarm created successfully',
    type: AlarmResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @ProjectContext() projectId: string,
    @Body() createAlarmDto: CreateAlarmDto,
    @CurrentUser() user: any,
  ): Promise<AlarmResponseDto> {
    return this.alarmsService.create(projectId, createAlarmDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alarms in a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Alarms retrieved successfully',
    type: [AlarmResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @ProjectContext() projectId: string,
  ): Promise<AlarmResponseDto[]> {
    return this.alarmsService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an alarm by ID' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Alarm ID' })
  @ApiResponse({
    status: 200,
    description: 'Alarm retrieved successfully',
    type: AlarmResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Alarm not found' })
  async findOne(
    @Param('id') id: string,
    @ProjectContext() projectId: string,
  ): Promise<AlarmResponseDto> {
    return this.alarmsService.findOne(id, projectId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an alarm' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Alarm ID' })
  @ApiResponse({
    status: 200,
    description: 'Alarm updated successfully',
    type: AlarmResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Alarm not found' })
  async update(
    @Param('id') id: string,
    @ProjectContext() projectId: string,
    @Body() updateAlarmDto: UpdateAlarmDto,
  ): Promise<AlarmResponseDto> {
    return this.alarmsService.update(id, projectId, updateAlarmDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an alarm' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'id', description: 'Alarm ID' })
  @ApiResponse({ status: 204, description: 'Alarm deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Alarm not found' })
  async remove(
    @Param('id') id: string,
    @ProjectContext() projectId: string,
  ): Promise<void> {
    return this.alarmsService.remove(id, projectId);
  }
}
