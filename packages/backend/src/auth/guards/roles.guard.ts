import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ProjectRoleType, ProjectRole } from '../../entities/project-role.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(ProjectRole)
    private readonly projectRoleRepository: Repository<ProjectRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Extract projectId from request params or body
    const projectId = request.params.projectId || request.body?.projectId;

    if (!projectId) {
      // If no projectId is specified, check if user has any of the required roles in any project
      // This is useful for system-wide operations
      const userRoles = await this.projectRoleRepository.find({
        where: { userId: user.id },
      });

      const hasRole = userRoles.some((projectRole) =>
        requiredRoles.includes(projectRole.role),
      );

      if (!hasRole) {
        throw new ForbiddenException(
          `User does not have required role. Required: ${requiredRoles.join(', ')}`,
        );
      }

      return true;
    }

    // Check if user has required role for the specific project
    const projectRole = await this.projectRoleRepository.findOne({
      where: {
        userId: user.id,
        projectId: projectId,
      },
    });

    if (!projectRole) {
      throw new ForbiddenException(
        'User does not have access to this project',
      );
    }

    if (!requiredRoles.includes(projectRole.role)) {
      throw new ForbiddenException(
        `User does not have required role for this project. Required: ${requiredRoles.join(', ')}, Current: ${projectRole.role}`,
      );
    }

    // Store the project role in the request for later use
    request.projectRole = projectRole;

    return true;
  }
}
