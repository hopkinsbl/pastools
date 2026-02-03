import apiClient from './client';

export interface Document {
  id: string;
  projectId: string;
  title: string;
  type: string;
  version?: string;
  fileId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDto {
  title: string;
  type: string;
  version?: string;
  fileId?: string;
  metadata?: Record<string, any>;
}

export const documentsApi = {
  getAll: async (projectId: string): Promise<Document[]> => {
    const response = await apiClient.get(`/api/projects/${projectId}/documents`);
    return response.data;
  },

  getById: async (projectId: string, id: string): Promise<Document> => {
    const response = await apiClient.get(`/api/projects/${projectId}/documents/${id}`);
    return response.data;
  },

  create: async (projectId: string, data: CreateDocumentDto): Promise<Document> => {
    const response = await apiClient.post(`/api/projects/${projectId}/documents`, data);
    return response.data;
  },

  update: async (projectId: string, id: string, data: Partial<CreateDocumentDto>): Promise<Document> => {
    const response = await apiClient.put(`/api/projects/${projectId}/documents/${id}`, data);
    return response.data;
  },

  delete: async (projectId: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${projectId}/documents/${id}`);
  },
};
