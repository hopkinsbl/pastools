import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { LinkResponseDto } from './dto/link-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { AuditLink } from '../audit/decorators/audit-link.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('Links')
@ApiBearerAuth()
@Controller('api')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post('links')
  @AuditLink('link')
  @ApiOperation({ summary: 'Create a new link between two entities' })
  @ApiResponse({
    status: 201,
    description: 'Link created successfully',
    type: LinkResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createLinkDto: CreateLinkDto,
    @CurrentUser() user: any,
  ): Promise<LinkResponseDto> {
    const link = await this.linksService.create(createLinkDto, user.id);
    return plainToInstance(LinkResponseDto, link, {
      excludeExtraneousValues: true,
    });
  }

  @Get('entities/:entityType/:entityId/links')
  @ApiOperation({ summary: 'Get all links for a specific entity' })
  @ApiParam({
    name: 'entityType',
    description: 'Type of entity (e.g., tag, equipment, alarm)',
    example: 'tag',
  })
  @ApiParam({
    name: 'entityId',
    description: 'UUID of the entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of links for the entity',
    type: [LinkResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<LinkResponseDto[]> {
    const links = await this.linksService.findByEntity(entityType, entityId);
    return plainToInstance(LinkResponseDto, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get('links/:id')
  @ApiOperation({ summary: 'Get a specific link by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the link',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Link details',
    type: LinkResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Link not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<LinkResponseDto> {
    const link = await this.linksService.findOne(id);
    return plainToInstance(LinkResponseDto, link, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('links/:id')
  @AuditLink('unlink')
  @ApiOperation({ summary: 'Delete a link' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the link',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Link deleted successfully' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.linksService.remove(id);
    return { message: 'Link deleted successfully' };
  }
}
