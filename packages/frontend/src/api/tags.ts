import apiClient from './client';

export interface Tag {
  id: string;
  projectId: string;
  type: 'AI' | 'AO' | 'DI' | 'DO' | 'PID' | 'Valve' | 'Drive' | 'Totaliser' | 'Calc';
  name: string;
  description: string;
  engineeringUnits?: string;
  scaleLow?: number;
  scaleHigh?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  type: Tag['type'];
  name: string;
  description: string;
  engineeringUnits?: string;
  scaleLow?: number;
  scaleHigh?: number;
  metadata?: Record<string, any>;
}

export const tagsApi = {
  getAll: async (projectId: string): Promise<Tag[]> => {
    const response = await apiClient.get(`/api/projects/${projectId}/tags`);
    return response.data;
  },

  getById: async (projectId: string, id: string): Promise<Tag> => {
    const response = await apiClient.get(`/api/projects/${projectId}/tags/${id}`);
    return response.data;
  },

  create: async (projectId: string, data: CreateTagDto): Promise<Tag> => {
    const response = await apiClient.post(`/api/projects/${projectId}/tags`, data);
    return response.data;
  },

  update: async (projectId: string, id: string, data: Partial<CreateTagDto>): Promise<Tag> => {
    const response = await apiClient.put(`/api/projects/${projectId}/tags/${id}`, data);
    return response.data;
  },

  delete: async (projectId: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${projectId}/tags/${id}`);
  },
};
