import { SetMetadata } from '@nestjs/common';
import { ProjectRoleType } from '../../entities/project-role.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ProjectRoleType[]) => SetMetadata(ROLES_KEY, roles);
