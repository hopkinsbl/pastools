import apiClient from './client';

export interface Job {
  id: string;
  type: 'Import' | 'Export' | 'Validation' | 'TestRun';
  projectId: string;
  projectName?: string;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  progress: number;
  result?: Record<string, any>;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  createdByName?: string;
}

export interface JobStats {
  total: number;
  queued: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export const jobsApi = {
  getAllJobs: async (status?: string): Promise<Job[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/api/jobs', { params });
    return response.data;
  },

  getJob: async (jobId: string): Promise<Job> => {
    const response = await apiClient.get(`/api/jobs/${jobId}`);
    return response.data;
  },

  getProjectJobs: async (projectId: string): Promise<Job[]> => {
    const response = await apiClient.get(`/api/jobs/projects/${projectId}`);
    return response.data;
  },

  getProjectJobStats: async (projectId: string): Promise<JobStats> => {
    const response = await apiClient.get(`/api/jobs/projects/${projectId}/stats`);
    return response.data;
  },

  cancelJob: async (jobId: string): Promise<Job> => {
    const response = await apiClient.post(`/api/jobs/${jobId}/cancel`);
    return response.data;
  },

  retryJob: async (jobId: string): Promise<Job> => {
    const response = await apiClient.post(`/api/jobs/${jobId}/retry`);
    return response.data;
  },
};
