import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectRole } from '../entities/project-role.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class ProjectRolesService {
  constructor(
    @InjectRepository(ProjectRole)
    private readonly projectRoleRepository: Repository<ProjectRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async assignRole(
    projectId: string,
    assignRoleDto: AssignRoleDto,
  ): Promise<ProjectRole> {
    // Verify project exists
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: assignRoleDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${assignRoleDto.userId} not found`,
      );
    }

    // Check if user already has a role in this project
    const existingRole = await this.projectRoleRepository.findOne({
      where: {
        projectId: projectId,
        userId: assignRoleDto.userId,
      },
    });

    if (existingRole) {
      throw new ConflictException(
        `User already has role ${existingRole.role} in this project. Use update endpoint to change role.`,
      );
    }

    // Create and save the project role
    const projectRole = this.projectRoleRepository.create({
      projectId: projectId,
      userId: assignRoleDto.userId,
      role: assignRoleDto.role,
    });

    return this.projectRoleRepository.save(projectRole);
  }

  async updateRole(
    projectId: string,
    userId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<ProjectRole> {
    const projectRole = await this.projectRoleRepository.findOne({
      where: {
        projectId: projectId,
        userId: userId,
      },
    });

    if (!projectRole) {
      throw new NotFoundException(
        `User does not have a role in this project`,
      );
    }

    projectRole.role = updateRoleDto.role;
    return this.projectRoleRepository.save(projectRole);
  }

  async removeRole(projectId: string, userId: string): Promise<void> {
    const projectRole = await this.projectRoleRepository.findOne({
      where: {
        projectId: projectId,
        userId: userId,
      },
    });

    if (!projectRole) {
      throw new NotFoundException(
        `User does not have a role in this project`,
      );
    }

    await this.projectRoleRepository.remove(projectRole);
  }

  async getProjectRoles(projectId: string): Promise<ProjectRole[]> {
    return this.projectRoleRepository.find({
      where: { projectId },
      relations: ['user'],
    });
  }

  async getUserRole(projectId: string, userId: string): Promise<ProjectRole> {
    const projectRole = await this.projectRoleRepository.findOne({
      where: {
        projectId: projectId,
        userId: userId,
      },
      relations: ['user', 'project'],
    });

    if (!projectRole) {
      throw new NotFoundException(
        `User does not have a role in this project`,
      );
    }

    return projectRole;
  }

  async getUserProjects(userId: string): Promise<ProjectRole[]> {
    return this.projectRoleRepository.find({
      where: { userId },
      relations: ['project'],
    });
  }
}
