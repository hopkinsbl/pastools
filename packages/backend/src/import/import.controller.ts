import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileInfoDto } from './dto/file-info.dto';
import {
  CreateImportProfileDto,
  ImportProfileResponseDto,
} from './dto/import-profile.dto';
import { StartImportDto } from './dto/start-import.dto';
import { ImportReportDto } from './dto/import-report.dto';

@ApiTags('Import')
@Controller('api/import')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('parse')
  @ApiOperation({ summary: 'Parse uploaded file and extract metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File parsed successfully',
    type: FileInfoDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or parse error' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname +
              '-' +
              uniqueSuffix +
              extname(file.originalname),
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.csv', '.xlsx', '.xls'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only CSV and XLSX files are allowed',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    }),
  )
  async parseFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileInfoDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const ext = extname(file.originalname).toLowerCase();
    const fileType = ext === '.csv' ? 'csv' : 'xlsx';

    try {
      return await this.importService.parseFile(file.path, fileType);
    } catch (error) {
      throw error;
    }
  }

  @Post('profiles')
  @ApiOperation({ summary: 'Create a new import profile' })
  @ApiResponse({
    status: 201,
    description: 'Import profile created',
    type: ImportProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createProfile(
    @Body() dto: CreateImportProfileDto,
    @CurrentUser() user: any,
  ): Promise<ImportProfileResponseDto> {
    return this.importService.createProfile(dto, user.id);
  }

  @Get('profiles')
  @ApiOperation({ summary: 'Get all import profiles' })
  @ApiResponse({
    status: 200,
    description: 'List of import profiles',
    type: [ImportProfileResponseDto],
  })
  async getProfiles(
    @Query('entityType') entityType?: string,
  ): Promise<ImportProfileResponseDto[]> {
    if (entityType) {
      return this.importService.getProfilesByEntityType(entityType);
    }
    return this.importService.getProfiles();
  }

  @Get('profiles/:id')
  @ApiOperation({ summary: 'Get import profile by ID' })
  @ApiResponse({
    status: 200,
    description: 'Import profile details',
    type: ImportProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(
    @Param('id') id: string,
  ): Promise<ImportProfileResponseDto> {
    return this.importService.getProfile(id);
  }

  @Delete('profiles/:id')
  @ApiOperation({ summary: 'Delete import profile' })
  @ApiResponse({
    status: 200,
    description: 'Import profile deleted',
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async deleteProfile(@Param('id') id: string): Promise<void> {
    return this.importService.deleteProfile(id);
  }

  @Post('projects/:projectId/start')
  @ApiOperation({ summary: 'Start an import job' })
  @ApiResponse({
    status: 201,
    description: 'Import job started',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async startImport(
    @Param('projectId') projectId: string,
    @Body() dto: StartImportDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.importService.startImport(projectId, dto, user.id);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get import job status' })
  @ApiResponse({
    status: 200,
    description: 'Job status',
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJob(@Param('jobId') jobId: string): Promise<any> {
    return this.importService.getJob(jobId);
  }

  @Get('projects/:projectId/jobs')
  @ApiOperation({ summary: 'Get all import jobs for a project' })
  @ApiResponse({
    status: 200,
    description: 'List of import jobs',
  })
  async getProjectJobs(@Param('projectId') projectId: string): Promise<any[]> {
    return this.importService.getProjectJobs(projectId);
  }

  @Get('jobs/:jobId/report')
  @ApiOperation({ summary: 'Get formatted import report for a completed job' })
  @ApiResponse({
    status: 200,
    description: 'Import report with success count, errors, and warnings',
    type: ImportReportDto,
  })
  @ApiResponse({ status: 400, description: 'Job not found or not complete' })
  async getImportReport(@Param('jobId') jobId: string): Promise<ImportReportDto> {
    return this.importService.getImportReport(jobId);
  }
}
