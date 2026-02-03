import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditOperation } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create an audit log entry
   */
  async createAuditLog(
    userId: string,
    operation: AuditOperation,
    entityType: string,
    entityId: string,
    changes?: Record<string, any>,
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      userId,
      operation,
      entityType,
      entityId,
      changes,
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Query audit logs with optional filters
   */
  async queryAuditLogs(filters: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    operation?: AuditOperation;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user');

    // Apply filters
    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.entityType) {
      query.andWhere('audit.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters.entityId) {
      query.andWhere('audit.entityId = :entityId', {
        entityId: filters.entityId,
      });
    }

    if (filters.operation) {
      query.andWhere('audit.operation = :operation', {
        operation: filters.operation,
      });
    }

    if (filters.startDate) {
      query.andWhere('audit.timestamp >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('audit.timestamp <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // Order by timestamp descending (most recent first)
    query.orderBy('audit.timestamp', 'DESC');

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    if (filters.limit) {
      query.take(filters.limit);
    }

    if (filters.offset) {
      query.skip(filters.offset);
    }

    const logs = await query.getMany();

    return { logs, total };
  }
}
