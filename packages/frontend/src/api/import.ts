import apiClient from './client';

export interface SheetInfo {
  name: string;
  headers: string[];
  rowCount: number;
}

export interface FileInfo {
  fileType: string;
  sheets: SheetInfo[];
}

export interface ImportProfile {
  id: string;
  name: string;
  entityType: string;
  columnMappings: Record<string, string>;
  createdAt: string;
  createdBy: string;
}

export interface CreateImportProfileDto {
  name: string;
  entityType: string;
  columnMappings: Record<string, string>;
}

export interface StartImportDto {
  filePath: string;
  fileType: 'csv' | 'xlsx';
  sheetName: string;
  entityType: string;
  columnMappings: Record<string, string>;
}

export interface Job {
  id: string;
  type: string;
  projectId: string;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  progress: number;
  result: any;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  createdBy: string;
}

export interface ImportErrorDetail {
  row: number;
  error: string;
  data: Record<string, any>;
  validationResults?: any[];
}

export interface ImportWarningDetail {
  row: number;
  warnings: string[];
  data: Record<string, any>;
  entityId?: string;
}

export interface ImportReport {
  jobId: string;
  status: string;
  success: number;
  errors: number;
  warnings: number;
  totalRows: number;
  errorDetails: ImportErrorDetail[];
  warningDetails: ImportWarningDetail[];
  sourceFile: string;
  sheetName: string;
  entityType: string;
  startedAt: string;
  completedAt: string;
}

export const importApi = {
  parseFile: async (file: File): Promise<FileInfo> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FileInfo>(
      '/api/import/parse',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  createProfile: async (
    profile: CreateImportProfileDto
  ): Promise<ImportProfile> => {
    const response = await apiClient.post<ImportProfile>(
      '/api/import/profiles',
      profile
    );
    return response.data;
  },

  getProfiles: async (entityType?: string): Promise<ImportProfile[]> => {
    const params = entityType ? { entityType } : {};
    const response = await apiClient.get<ImportProfile[]>(
      '/api/import/profiles',
      { params }
    );
    return response.data;
  },

  getProfile: async (id: string): Promise<ImportProfile> => {
    const response = await apiClient.get<ImportProfile>(
      `/api/import/profiles/${id}`
    );
    return response.data;
  },

  deleteProfile: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/import/profiles/${id}`);
  },

  startImport: async (
    projectId: string,
    dto: StartImportDto
  ): Promise<Job> => {
    const response = await apiClient.post<Job>(
      `/api/import/projects/${projectId}/start`,
      dto
    );
    return response.data;
  },

  getJob: async (jobId: string): Promise<Job> => {
    const response = await apiClient.get<Job>(`/api/import/jobs/${jobId}`);
    return response.data;
  },

  getProjectJobs: async (projectId: string): Promise<Job[]> => {
    const response = await apiClient.get<Job[]>(
      `/api/import/projects/${projectId}/jobs`
    );
    return response.data;
  },

  getImportReport: async (jobId: string): Promise<ImportReport> => {
    const response = await apiClient.get<ImportReport>(
      `/api/import/jobs/${jobId}/report`
    );
    return response.data;
  },
};
