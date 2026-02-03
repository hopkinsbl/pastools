import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Query audit logs with optional filters
   * GET /api/audit?userId=xxx&entityType=tag&startDate=2024-01-01&limit=50&offset=0
   */
  @Get()
  async queryAuditLogs(@Query() query: QueryAuditLogsDto) {
    const filters = {
      userId: query.userId,
      entityType: query.entityType,
      entityId: query.entityId,
      operation: query.operation,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };

    const result = await this.auditService.queryAuditLogs(filters);

    return {
      data: result.logs,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    };
  }
}
