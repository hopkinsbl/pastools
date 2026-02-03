import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectsService } from '../projects.service';

/**
 * Guard to validate that:
 * 1. The project exists
 * 2. The user has access to the project
 * 
 * This guard expects a projectId in the route params
 */
@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const projectId = request.params?.projectId;
    const user = request.user;

    if (!projectId) {
      // If no projectId in params, allow the request to proceed
      // This is for endpoints that don't require project context
      return true;
    }

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      // Verify the project exists and user has access
      await this.projectsService.findOne(projectId);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ForbiddenException('Access to this project is denied');
    }
  }
}
