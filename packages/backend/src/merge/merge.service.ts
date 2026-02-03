import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { Equipment } from '../entities/equipment.entity';
import { Alarm } from '../entities/alarm.entity';
import { Document } from '../entities/document.entity';
import { Link } from '../entities/link.entity';
import { Attachment } from '../entities/attachment.entity';
import { AuditLog, AuditOperation } from '../entities/audit-log.entity';
import {
  DuplicateMatchRule,
  DuplicateCandidate,
  MergeRequest,
  MergeResult,
  MergeStrategy,
} from './interfaces/merge-strategy.interface';

@Injectable()
export class MergeService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Alarm)
    private alarmRepository: Repository<Alarm>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private dataSource: DataSource,
  ) {}

  /**
   * Detect duplicate entities based on configurable match rules
   */
  async detectDuplicates(
    projectId: string,
    entityType: string,
    entities: any[],
    matchRule?: DuplicateMatchRule,
  ): Promise<DuplicateCandidate[]> {
    const repository = this.getRepository(entityType);
    const existingEntities = await repository.find({ where: { projectId } });

    const defaultRule: DuplicateMatchRule = matchRule || {
      entityType,
      matchFields: ['name'],
      caseSensitive: false,
      exactMatch: false,
      similarityThreshold: 0.8,
    };

    const duplicates: DuplicateCandidate[] = [];

    for (const newEntity of entities) {
      for (const existingEntity of existingEntities) {
        const matchResult = this.compareEntities(
          existingEntity,
          newEntity,
          defaultRule,
        );

        if (matchResult.isMatch) {
          duplicates.push({
            existingEntity,
            newEntity,
            matchScore: matchResult.score,
            matchedFields: matchResult.matchedFields,
          });
        }
      }
    }

    return duplicates;
  }

  /**
   * Merge two entities using the specified strategy
   */
  async mergeEntities(
    request: MergeRequest,
    userId: string,
  ): Promise<MergeResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repository = this.getRepository(request.entityType);

      // Fetch both entities
      const sourceEntity = await repository.findOne({
        where: { id: request.sourceEntityId } as any,
      });
      const targetEntity = await repository.findOne({
        where: { id: request.targetEntityId } as any,
      });

      if (!sourceEntity || !targetEntity) {
        throw new NotFoundException('One or both entities not found');
      }

      // Apply merge strategy
      let mergedEntity: any;
      switch (request.strategy) {
        case MergeStrategy.SKIP:
          mergedEntity = targetEntity;
          break;
        case MergeStrategy.OVERWRITE:
          mergedEntity = { ...targetEntity, ...sourceEntity, id: targetEntity.id };
          break;
        case MergeStrategy.MERGE_FIELDS:
          mergedEntity = this.mergeFields(
            sourceEntity,
            targetEntity,
            request.fieldSelections,
          );
          break;
        default:
          throw new BadRequestException('Invalid merge strategy');
      }

      // Save merged entity
      await queryRunner.manager.save(repository.target, mergedEntity);

      // Transfer links from source to target
      const sourceLinks = await this.linkRepository.find({
        where: [
          { sourceEntityId: request.sourceEntityId },
          { targetEntityId: request.sourceEntityId },
        ],
      });

      for (const link of sourceLinks) {
        if (link.sourceEntityId === request.sourceEntityId) {
          link.sourceEntityId = request.targetEntityId;
        }
        if (link.targetEntityId === request.sourceEntityId) {
          link.targetEntityId = request.targetEntityId;
        }
        await queryRunner.manager.save(Link, link);
      }

      // Transfer attachments from source to target
      const sourceAttachments = await this.attachmentRepository.find({
        where: { entityId: request.sourceEntityId },
      });

      for (const attachment of sourceAttachments) {
        attachment.entityId = request.targetEntityId;
        await queryRunner.manager.save(Attachment, attachment);
      }

      // Delete source entity
      await queryRunner.manager.remove(repository.target, sourceEntity);

      // Create audit log entry
      const auditLog = this.auditLogRepository.create({
        userId,
        operation: AuditOperation.MERGE,
        entityType: request.entityType,
        entityId: request.targetEntityId,
        changes: {
          mergedFrom: request.sourceEntityId,
          strategy: request.strategy,
          preservedLinks: sourceLinks.length,
          preservedAttachments: sourceAttachments.length,
        },
        timestamp: new Date(),
      });

      const savedAuditLog = await queryRunner.manager.save(AuditLog, auditLog);

      await queryRunner.commitTransaction();

      return {
        success: true,
        mergedEntityId: request.targetEntityId,
        preservedLinks: sourceLinks.length,
        preservedAttachments: sourceAttachments.length,
        auditLogId: savedAuditLog.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return {
        success: false,
        mergedEntityId: '',
        preservedLinks: 0,
        preservedAttachments: 0,
        auditLogId: '',
        error: error.message,
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get repository for entity type
   */
  private getRepository(entityType: string): Repository<any> {
    switch (entityType.toLowerCase()) {
      case 'tag':
        return this.tagRepository;
      case 'equipment':
        return this.equipmentRepository;
      case 'alarm':
        return this.alarmRepository;
      case 'document':
        return this.documentRepository;
      default:
        throw new BadRequestException(`Unsupported entity type: ${entityType}`);
    }
  }

  /**
   * Compare two entities based on match rules
   */
  private compareEntities(
    entity1: any,
    entity2: any,
    rule: DuplicateMatchRule,
  ): { isMatch: boolean; score: number; matchedFields: string[] } {
    const matchedFields: string[] = [];
    let totalScore = 0;

    for (const field of rule.matchFields) {
      const value1 = entity1[field];
      const value2 = entity2[field];

      if (!value1 || !value2) {
        continue;
      }

      let fieldScore = 0;

      if (typeof value1 === 'string' && typeof value2 === 'string') {
        const str1 = rule.caseSensitive ? value1 : value1.toLowerCase();
        const str2 = rule.caseSensitive ? value2 : value2.toLowerCase();

        if (rule.exactMatch) {
          fieldScore = str1 === str2 ? 1 : 0;
        } else {
          fieldScore = this.calculateSimilarity(str1, str2);
        }
      } else {
        fieldScore = value1 === value2 ? 1 : 0;
      }

      if (fieldScore > (rule.similarityThreshold || 0.8)) {
        matchedFields.push(field);
      }

      totalScore += fieldScore;
    }

    const averageScore = totalScore / rule.matchFields.length;
    const isMatch = averageScore >= (rule.similarityThreshold || 0.8);

    return { isMatch, score: averageScore, matchedFields };
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Merge fields from source and target based on field selections
   */
  private mergeFields(
    sourceEntity: any,
    targetEntity: any,
    fieldSelections?: Record<string, 'source' | 'target'>,
  ): any {
    const merged = { ...targetEntity };

    if (!fieldSelections) {
      // Default: prefer source for non-null values
      for (const key of Object.keys(sourceEntity)) {
        if (sourceEntity[key] !== null && sourceEntity[key] !== undefined) {
          merged[key] = sourceEntity[key];
        }
      }
    } else {
      // Use explicit field selections
      for (const [field, selection] of Object.entries(fieldSelections)) {
        if (selection === 'source') {
          merged[field] = sourceEntity[field];
        } else {
          merged[field] = targetEntity[field];
        }
      }
    }

    // Always preserve target ID
    merged.id = targetEntity.id;

    return merged;
  }
}
