import apiClient from './client';

export interface StartExportRequest {
  entityType: 'tag' | 'equipment' | 'alarm' | 'document' | 'tq' | 'punchlist';
  format: 'csv' | 'xlsx';
  columns: string[];
  filters?: Record<string, any>;
}

export interface ExportJob {
  id: string;
  type: string;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  progress: number;
  result?: {
    filePath: string;
    fileName: string;
    recordCount: number;
  };
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export const exportApi = {
  startExport: async (projectId: string, request: StartExportRequest) => {
    const response = await apiClient.post(
      `/api/projects/${projectId}/export`,
      request
    );
    return response.data;
  },

  getJobStatus: async (projectId: string, jobId: string): Promise<ExportJob> => {
    const response = await apiClient.get(
      `/api/projects/${projectId}/export/jobs/${jobId}`
    );
    return response.data;
  },

  getDownloadUrl: (projectId: string, jobId: string): string => {
    return `/api/projects/${projectId}/export/jobs/${jobId}/download`;
  },
};
