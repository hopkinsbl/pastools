import { Repository, FindOptionsWhere } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

/**
 * Base service class for entities that are scoped to a project
 * This ensures that all queries automatically filter by projectId
 */
export abstract class BaseProjectScopedService<T extends { id: string; projectId: string }> {
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * Find all entities for a specific project
   */
  protected async findAllInProject(
    projectId: string,
    options?: Partial<FindOptionsWhere<T>>,
  ): Promise<T[]> {
    return this.repository.find({
      where: {
        projectId,
        ...options,
      } as FindOptionsWhere<T>,
    });
  }

  /**
   * Find one entity by ID within a specific project
   * Throws NotFoundException if not found or not in the project
   */
  protected async findOneInProject(
    id: string,
    projectId: string,
  ): Promise<T> {
    const entity = await this.repository.findOne({
      where: {
        id,
        projectId,
      } as FindOptionsWhere<T>,
    });

    if (!entity) {
      throw new NotFoundException(
        `Entity with ID ${id} not found in project ${projectId}`,
      );
    }

    return entity;
  }

  /**
   * Create an entity within a specific project
   */
  protected async createInProject(
    projectId: string,
    data: Partial<T>,
    userId: string,
  ): Promise<T> {
    const entity = this.repository.create({
      ...data,
      projectId,
      createdBy: userId,
    } as any);

    const saved = await this.repository.save(entity);
    // TypeORM save returns T when given a single entity
    return Array.isArray(saved) ? saved[0] : saved;
  }

  /**
   * Update an entity within a specific project
   * Throws NotFoundException if not found or not in the project
   */
  protected async updateInProject(
    id: string,
    projectId: string,
    data: Partial<T>,
  ): Promise<T> {
    const entity = await this.findOneInProject(id, projectId);
    Object.assign(entity, data);
    const updated = await this.repository.save(entity);
    // TypeORM save returns T when given a single entity
    return Array.isArray(updated) ? updated[0] : updated;
  }

  /**
   * Delete an entity within a specific project
   * Throws NotFoundException if not found or not in the project
   */
  protected async deleteInProject(
    id: string,
    projectId: string,
  ): Promise<void> {
    const entity = await this.findOneInProject(id, projectId);
    await this.repository.remove(entity);
  }

  /**
   * Count entities within a specific project
   */
  protected async countInProject(
    projectId: string,
    options?: Partial<FindOptionsWhere<T>>,
  ): Promise<number> {
    return this.repository.count({
      where: {
        projectId,
        ...options,
      } as FindOptionsWhere<T>,
    });
  }
}
