import apiClient from './client';

export interface DuplicateMatchRule {
  entityType: string;
  matchFields: string[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
  similarityThreshold?: number;
}

export interface DuplicateCandidate {
  existingEntity: any;
  newEntity: any;
  matchScore: number;
  matchedFields: string[];
}

export interface DetectDuplicatesRequest {
  entityType: string;
  entities: any[];
  matchRule?: DuplicateMatchRule;
}

export enum MergeStrategy {
  SKIP = 'skip',
  OVERWRITE = 'overwrite',
  MERGE_FIELDS = 'merge_fields',
}

export interface MergeRequest {
  entityType: string;
  sourceEntityId: string;
  targetEntityId: string;
  strategy: MergeStrategy;
  fieldSelections?: Record<string, 'source' | 'target'>;
}

export interface MergeResult {
  success: boolean;
  mergedEntityId: string;
  preservedLinks: number;
  preservedAttachments: number;
  auditLogId: string;
  error?: string;
}

export const mergeApi = {
  detectDuplicates: async (
    projectId: string,
    request: DetectDuplicatesRequest
  ): Promise<DuplicateCandidate[]> => {
    const response = await apiClient.post(
      `/projects/${projectId}/merge/detect-duplicates`,
      request
    );
    return response.data;
  },

  mergeEntities: async (
    projectId: string,
    request: MergeRequest
  ): Promise<MergeResult> => {
    const response = await apiClient.post(
      `/projects/${projectId}/merge/merge`,
      request
    );
    return response.data;
  },
};
