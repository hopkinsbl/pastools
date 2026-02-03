import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      createdBy: userId,
    });

    const savedProject = await this.projectRepository.save(project);
    return this.toResponseDto(savedProject);
  }

  async findAll(): Promise<ProjectResponseDto[]> {
    // For now, return all projects
    // In a full implementation, this would filter by user's project roles
    const projects = await this.projectRepository.find({
      order: { createdAt: 'DESC' },
    });

    return projects.map((project) => this.toResponseDto(project));
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // In a full implementation, check if user has access to this project
    return this.toResponseDto(project);
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // In a full implementation, check if user has permission to update this project

    // Merge the updates
    Object.assign(project, updateProjectDto);

    const updatedProject = await this.projectRepository.save(project);
    return this.toResponseDto(updatedProject);
  }

  async remove(id: string): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // In a full implementation, check if user has permission to delete this project

    await this.projectRepository.remove(project);
  }

  private toResponseDto(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      metadata: project.metadata,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      createdBy: project.createdBy,
    };
  }
}
