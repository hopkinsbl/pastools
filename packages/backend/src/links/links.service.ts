import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from '../entities/link.entity';
import { CreateLinkDto } from './dto/create-link.dto';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
  ) {}

  /**
   * Create a new link between two entities
   */
  async create(createLinkDto: CreateLinkDto, userId: string): Promise<Link> {
    const link = this.linkRepository.create({
      ...createLinkDto,
      createdBy: userId,
    });

    return await this.linkRepository.save(link);
  }

  /**
   * Get all links for a specific entity
   */
  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<Link[]> {
    return await this.linkRepository.find({
      where: [
        { sourceEntityType: entityType, sourceEntityId: entityId },
        { targetEntityType: entityType, targetEntityId: entityId },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific link by ID
   */
  async findOne(id: string): Promise<Link> {
    const link = await this.linkRepository.findOne({ where: { id } });
    
    if (!link) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }
    
    return link;
  }

  /**
   * Delete a link
   */
  async remove(id: string): Promise<void> {
    const link = await this.findOne(id);
    await this.linkRepository.remove(link);
  }

  /**
   * Check if an entity has any active links
   */
  async hasLinks(entityType: string, entityId: string): Promise<boolean> {
    const count = await this.linkRepository.count({
      where: [
        { sourceEntityType: entityType, sourceEntityId: entityId },
        { targetEntityType: entityType, targetEntityId: entityId },
      ],
    });
    
    return count > 0;
  }

  /**
   * Count links for an entity
   */
  async countLinks(entityType: string, entityId: string): Promise<number> {
    return await this.linkRepository.count({
      where: [
        { sourceEntityType: entityType, sourceEntityId: entityId },
        { targetEntityType: entityType, targetEntityId: entityId },
      ],
    });
  }
}
