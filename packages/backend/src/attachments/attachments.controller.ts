import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AttachmentResponseDto } from './dto/attachment-response.dto';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { plainToInstance } from 'class-transformer';

@ApiTags('Attachments')
@Controller('attachments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(AuditInterceptor)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * Create an attachment linking a file to an entity
   * POST /attachments
   */
  @Post()
  @ApiOperation({
    summary: 'Create attachment',
    description: 'Attach a file to any entity type',
  })
  @ApiResponse({
    status: 201,
    description: 'Attachment created successfully',
    type: AttachmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async create(
    @Body() createAttachmentDto: CreateAttachmentDto,
    @Request() req,
  ): Promise<AttachmentResponseDto> {
    const userId = req.user.userId;
    const attachment = await this.attachmentsService.create(
      createAttachmentDto,
      userId,
    );

    return plainToInstance(AttachmentResponseDto, attachment, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get all attachments for a specific entity
   * GET /attachments/entity/:entityType/:entityId
   */
  @Get('entity/:entityType/:entityId')
  @ApiOperation({
    summary: 'Get entity attachments',
    description: 'Retrieve all attachments for a specific entity',
  })
  @ApiParam({
    name: 'entityType',
    description: 'Type of entity (e.g., tag, equipment, alarm)',
    example: 'tag',
  })
  @ApiParam({
    name: 'entityId',
    description: 'ID of the entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of attachments',
    type: [AttachmentResponseDto],
  })
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<AttachmentResponseDto[]> {
    const attachments = await this.attachmentsService.findByEntity(
      entityType,
      entityId,
    );

    return plainToInstance(AttachmentResponseDto, attachments, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get a specific attachment by ID
   * GET /attachments/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get attachment',
    description: 'Retrieve a specific attachment by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Attachment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Attachment details',
    type: AttachmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async findOne(@Param('id') id: string): Promise<AttachmentResponseDto> {
    const attachment = await this.attachmentsService.findOne(id);

    return plainToInstance(AttachmentResponseDto, attachment, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Delete an attachment
   * DELETE /attachments/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete attachment',
    description: 'Remove an attachment (does not delete the underlying file)',
  })
  @ApiParam({
    name: 'id',
    description: 'Attachment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 204, description: 'Attachment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.attachmentsService.remove(id);
  }
}
