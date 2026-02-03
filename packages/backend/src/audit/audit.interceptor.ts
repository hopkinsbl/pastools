import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuditOperation } from '../entities/audit-log.entity';
import { AUDIT_LINK_KEY } from './decorators/audit-link.decorator';

/**
 * Interceptor to automatically log all create, update, and delete operations
 * 
 * Usage: Apply @UseInterceptors(AuditInterceptor) to controllers or methods
 * 
 * The interceptor extracts:
 * - User ID from request.user (set by JWT authentication)
 * - Operation type from HTTP method (POST=Create, PUT/PATCH=Update, DELETE=Delete)
 * - Entity type from route metadata or controller name
 * - Entity ID from response or route params
 * - Changes from request body (for updates)
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Extract user from request (set by JWT guard)
    const user = request.user;
    
    // Skip audit logging if no user (e.g., public endpoints)
    if (!user || !user.id) {
      return next.handle();
    }

    // Check if this is a link/unlink operation
    const linkOperation = this.reflector.get<string>(
      AUDIT_LINK_KEY,
      context.getHandler(),
    );

    // Extract HTTP method
    const method = request.method;
    
    // Determine operation type
    let operation: AuditOperation | null = null;
    if (linkOperation === 'link') {
      operation = AuditOperation.LINK;
    } else if (linkOperation === 'unlink') {
      operation = AuditOperation.UNLINK;
    } else if (method === 'POST') {
      operation = AuditOperation.CREATE;
    } else if (method === 'PUT' || method === 'PATCH') {
      operation = AuditOperation.UPDATE;
    } else if (method === 'DELETE') {
      operation = AuditOperation.DELETE;
    }

    // Skip if not a tracked operation
    if (!operation) {
      return next.handle();
    }

    // Extract entity type from route path
    // Example: /api/projects/:projectId/tags/:id -> entityType = 'tag'
    const entityType = this.extractEntityType(request.path);
    
    // Extract changes from request body (for create/update/link)
    const changes = (operation === AuditOperation.CREATE || 
                     operation === AuditOperation.UPDATE ||
                     operation === AuditOperation.LINK)
      ? request.body
      : undefined;

    return next.handle().pipe(
      tap(async (data) => {
        try {
          // Extract entity ID from response or route params
          const entityId = this.extractEntityId(data, request.params);
          
          if (entityType && entityId) {
            await this.auditService.createAuditLog(
              user.id,
              operation,
              entityType,
              entityId,
              changes,
            );
          }
        } catch (error) {
          // Log error but don't fail the request
          console.error('Failed to create audit log:', error);
        }
      }),
    );
  }

  /**
   * Extract entity type from route path
   * Examples:
   * - /api/projects/:id -> 'project'
   * - /api/projects/:projectId/tags/:id -> 'tag'
   * - /api/projects/:projectId/equipment/:id -> 'equipment'
   */
  private extractEntityType(path: string): string | null {
    const segments = path.split('/').filter(s => s && s !== 'api');
    
    // Find the last non-param segment before an ID param
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      // Skip UUID-like segments (entity IDs)
      if (!this.isUuidLike(segment)) {
        // Convert plural to singular (e.g., 'tags' -> 'tag')
        return segment.endsWith('s') ? segment.slice(0, -1) : segment;
      }
    }
    
    return null;
  }

  /**
   * Extract entity ID from response data or route params
   */
  private extractEntityId(data: any, params: any): string | null {
    // Try to get ID from response data
    if (data && typeof data === 'object') {
      if (data.id) {
        return data.id;
      }
    }
    
    // Try to get ID from route params
    if (params && params.id) {
      return params.id;
    }
    
    return null;
  }

  /**
   * Check if a string looks like a UUID
   */
  private isUuidLike(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
