import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { Equipment } from '../entities/equipment.entity';
import { Document } from '../entities/document.entity';
import { TechnicalQuery } from '../entities/technical-query.entity';
import { PunchlistItem } from '../entities/punchlist-item.entity';
import { SearchQueryDto, SearchEntityType } from './dto/search-query.dto';
import { SearchResultDto, SearchResultItemDto } from './dto/search-result.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(TechnicalQuery)
    private readonly tqRepository: Repository<TechnicalQuery>,
    @InjectRepository(PunchlistItem)
    private readonly punchlistRepository: Repository<PunchlistItem>,
  ) {}

  async search(
    projectId: string,
    query: SearchQueryDto,
  ): Promise<SearchResultDto> {
    const { q, entityType, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    // Determine which entity types to search
    const entityTypes = entityType
      ? [entityType]
      : [
          SearchEntityType.TAG,
          SearchEntityType.EQUIPMENT,
          SearchEntityType.DOCUMENT,
          SearchEntityType.TECHNICAL_QUERY,
          SearchEntityType.PUNCHLIST_ITEM,
        ];

    // Perform searches across all entity types
    const searchPromises = entityTypes.map((type) =>
      this.searchEntityType(projectId, q, type),
    );

    const allResults = await Promise.all(searchPromises);
    const flatResults = allResults.flat();

    // Sort by rank (descending)
    flatResults.sort((a, b) => b.rank - a.rank);

    // Calculate pagination
    const total = flatResults.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedResults = flatResults.slice(offset, offset + limit);

    return {
      results: paginatedResults,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private async searchEntityType(
    projectId: string,
    searchQuery: string,
    entityType: SearchEntityType,
  ): Promise<SearchResultItemDto[]> {
    switch (entityType) {
      case SearchEntityType.TAG:
        return this.searchTags(projectId, searchQuery);
      case SearchEntityType.EQUIPMENT:
        return this.searchEquipment(projectId, searchQuery);
      case SearchEntityType.DOCUMENT:
        return this.searchDocuments(projectId, searchQuery);
      case SearchEntityType.TECHNICAL_QUERY:
        return this.searchTechnicalQueries(projectId, searchQuery);
      case SearchEntityType.PUNCHLIST_ITEM:
        return this.searchPunchlistItems(projectId, searchQuery);
      default:
        return [];
    }
  }

  private async searchTags(
    projectId: string,
    searchQuery: string,
  ): Promise<SearchResultItemDto[]> {
    const query = this.tagRepository
      .createQueryBuilder('tag')
      .select([
        'tag.id',
        'tag.name',
        'tag.description',
        `ts_rank(
          to_tsvector('english', COALESCE(tag.name, '') || ' ' || COALESCE(tag.description, '')),
          plainto_tsquery('english', :searchQuery)
        ) as rank`,
      ])
      .where('tag.projectId = :projectId', { projectId })
      .andWhere(
        `to_tsvector('english', COALESCE(tag.name, '') || ' ' || COALESCE(tag.description, '')) @@ plainto_tsquery('english', :searchQuery)`,
        { searchQuery },
      )
      .orderBy('rank', 'DESC')
      .limit(100);

    const results = await query.getRawMany();

    return results.map((result) => ({
      id: result.tag_id,
      entityType: 'tag',
      name: result.tag_name,
      description: result.tag_description || '',
      rank: parseFloat(result.rank),
      highlight: this.highlightMatch(
        result.tag_name + ' ' + (result.tag_description || ''),
        searchQuery,
      ),
    }));
  }

  private async searchEquipment(
    projectId: string,
    searchQuery: string,
  ): Promise<SearchResultItemDto[]> {
    const query = this.equipmentRepository
      .createQueryBuilder('equipment')
      .select([
        'equipment.id',
        'equipment.name',
        'equipment.description',
        `ts_rank(
          to_tsvector('english', COALESCE(equipment.name, '') || ' ' || COALESCE(equipment.description, '')),
          plainto_tsquery('english', :searchQuery)
        ) as rank`,
      ])
      .where('equipment.projectId = :projectId', { projectId })
      .andWhere(
        `to_tsvector('english', COALESCE(equipment.name, '') || ' ' || COALESCE(equipment.description, '')) @@ plainto_tsquery('english', :searchQuery)`,
        { searchQuery },
      )
      .orderBy('rank', 'DESC')
      .limit(100);

    const results = await query.getRawMany();

    return results.map((result) => ({
      id: result.equipment_id,
      entityType: 'equipment',
      name: result.equipment_name,
      description: result.equipment_description || '',
      rank: parseFloat(result.rank),
      highlight: this.highlightMatch(
        result.equipment_name + ' ' + (result.equipment_description || ''),
        searchQuery,
      ),
    }));
  }

  private async searchDocuments(
    projectId: string,
    searchQuery: string,
  ): Promise<SearchResultItemDto[]> {
    const query = this.documentRepository
      .createQueryBuilder('document')
      .select([
        'document.id',
        'document.title',
        'document.type',
        `ts_rank(
          to_tsvector('english', COALESCE(document.title, '') || ' ' || COALESCE(document.type, '')),
          plainto_tsquery('english', :searchQuery)
        ) as rank`,
      ])
      .where('document.projectId = :projectId', { projectId })
      .andWhere(
        `to_tsvector('english', COALESCE(document.title, '') || ' ' || COALESCE(document.type, '')) @@ plainto_tsquery('english', :searchQuery)`,
        { searchQuery },
      )
      .orderBy('rank', 'DESC')
      .limit(100);

    const results = await query.getRawMany();

    return results.map((result) => ({
      id: result.document_id,
      entityType: 'document',
      name: result.document_title,
      description: result.document_type || '',
      rank: parseFloat(result.rank),
      highlight: this.highlightMatch(
        result.document_title + ' ' + (result.document_type || ''),
        searchQuery,
      ),
    }));
  }

  private async searchTechnicalQueries(
    projectId: string,
    searchQuery: string,
  ): Promise<SearchResultItemDto[]> {
    const query = this.tqRepository
      .createQueryBuilder('tq')
      .select([
        'tq.id',
        'tq.title',
        'tq.description',
        `ts_rank(
          to_tsvector('english', COALESCE(tq.title, '') || ' ' || COALESCE(tq.description, '')),
          plainto_tsquery('english', :searchQuery)
        ) as rank`,
      ])
      .where('tq.projectId = :projectId', { projectId })
      .andWhere(
        `to_tsvector('english', COALESCE(tq.title, '') || ' ' || COALESCE(tq.description, '')) @@ plainto_tsquery('english', :searchQuery)`,
        { searchQuery },
      )
      .orderBy('rank', 'DESC')
      .limit(100);

    const results = await query.getRawMany();

    return results.map((result) => ({
      id: result.tq_id,
      entityType: 'technical_query',
      name: result.tq_title,
      description: result.tq_description || '',
      rank: parseFloat(result.rank),
      highlight: this.highlightMatch(
        result.tq_title + ' ' + (result.tq_description || ''),
        searchQuery,
      ),
    }));
  }

  private async searchPunchlistItems(
    projectId: string,
    searchQuery: string,
  ): Promise<SearchResultItemDto[]> {
    const query = this.punchlistRepository
      .createQueryBuilder('punchlist')
      .select([
        'punchlist.id',
        'punchlist.description',
        'punchlist.category',
        `ts_rank(
          to_tsvector('english', COALESCE(punchlist.description, '') || ' ' || COALESCE(punchlist.closureCriteria, '')),
          plainto_tsquery('english', :searchQuery)
        ) as rank`,
      ])
      .where('punchlist.projectId = :projectId', { projectId })
      .andWhere(
        `to_tsvector('english', COALESCE(punchlist.description, '') || ' ' || COALESCE(punchlist.closureCriteria, '')) @@ plainto_tsquery('english', :searchQuery)`,
        { searchQuery },
      )
      .orderBy('rank', 'DESC')
      .limit(100);

    const results = await query.getRawMany();

    return results.map((result) => ({
      id: result.punchlist_id,
      entityType: 'punchlist_item',
      name: `Punchlist ${result.punchlist_category}`,
      description: result.punchlist_description || '',
      rank: parseFloat(result.rank),
      highlight: this.highlightMatch(
        result.punchlist_description || '',
        searchQuery,
      ),
    }));
  }

  private highlightMatch(text: string, searchQuery: string): string {
    if (!text || !searchQuery) return text;

    // Simple highlighting - wrap matching words in <mark> tags
    const words = searchQuery.toLowerCase().split(/\s+/);
    let highlighted = text;

    words.forEach((word) => {
      if (word.length > 2) {
        // Only highlight words longer than 2 characters
        const regex = new RegExp(`(${word})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
      }
    });

    // Truncate to reasonable length for preview
    if (highlighted.length > 200) {
      highlighted = highlighted.substring(0, 200) + '...';
    }

    return highlighted;
  }
}
