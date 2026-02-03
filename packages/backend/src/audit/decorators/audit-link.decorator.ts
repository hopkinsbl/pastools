import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark an endpoint as a link/unlink operation
 * This helps the audit interceptor identify link operations
 * 
 * Usage:
 * @AuditLink('link') or @AuditLink('unlink')
 */
export const AUDIT_LINK_KEY = 'audit_link_operation';
export const AuditLink = (operation: 'link' | 'unlink') =>
  SetMetadata(AUDIT_LINK_KEY, operation);
