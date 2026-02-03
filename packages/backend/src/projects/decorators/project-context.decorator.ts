import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the project ID from the request
 * This can be used in controllers to get the current project context
 * 
 * Usage:
 * @ProjectContext() projectId: string
 */
export const ProjectContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    
    // Try to get projectId from route params first
    if (request.params?.projectId) {
      return request.params.projectId;
    }
    
    // Try to get from query params
    if (request.query?.projectId) {
      return request.query.projectId;
    }
    
    // Try to get from body
    if (request.body?.projectId) {
      return request.body.projectId;
    }
    
    return undefined;
  },
);
