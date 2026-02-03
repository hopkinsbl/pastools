/**
 * Merge strategy options for handling duplicate entities
 */
export enum MergeStrategy {
  SKIP = 'skip', // Skip the duplicate, keep existing
  OVERWRITE = 'overwrite', // Replace existing with new
  MERGE_FIELDS = 'merge_fields', // Merge fields from both entities
}

/**
 * Configuration for duplicate detection
 */
export interface DuplicateMatchRule {
  entityType: string;
  matchFields: string[]; // Fields to compare for duplicate detection
  caseSensitive?: boolean;
  exactMatch?: boolean; // If false, use fuzzy matching
  similarityThreshold?: number; // For fuzzy matching (0-1)
}

/**
 * Result of duplicate detection
 */
export interface DuplicateCandidate {
  existingEntity: any;
  newEntity: any;
  matchScore: number; // 0-1, how similar they are
  matchedFields: string[]; // Which fields matched
}

/**
 * Request to merge two entities
 */
export interface MergeRequest {
  entityType: string;
  sourceEntityId: string; // Entity to merge from (will be deleted)
  targetEntityId: string; // Entity to merge into (will be kept)
  strategy: MergeStrategy;
  fieldSelections?: Record<string, 'source' | 'target'>; // For MERGE_FIELDS strategy
}

/**
 * Result of a merge operation
 */
export interface MergeResult {
  success: boolean;
  mergedEntityId: string;
  preservedLinks: number;
  preservedAttachments: number;
  auditLogId: string;
  error?: string;
}
