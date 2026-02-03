import apiClient from './client';

export interface Project {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get('/api/projects');
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/api/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await apiClient.post('/api/projects', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    const response = await apiClient.put(`/api/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`);
  },
};
