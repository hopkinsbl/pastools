import apiClient from './client';

export interface Equipment {
  id: string;
  projectId: string;
  name: string;
  description: string;
  type: string;
  location?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentDto {
  name: string;
  description: string;
  type: string;
  location?: string;
  metadata?: Record<string, any>;
}

export const equipmentApi = {
  getAll: async (projectId: string): Promise<Equipment[]> => {
    const response = await apiClient.get(`/api/projects/${projectId}/equipment`);
    return response.data;
  },

  getById: async (projectId: string, id: string): Promise<Equipment> => {
    const response = await apiClient.get(`/api/projects/${projectId}/equipment/${id}`);
    return response.data;
  },

  create: async (projectId: string, data: CreateEquipmentDto): Promise<Equipment> => {
    const response = await apiClient.post(`/api/projects/${projectId}/equipment`, data);
    return response.data;
  },

  update: async (projectId: string, id: string, data: Partial<CreateEquipmentDto>): Promise<Equipment> => {
    const response = await apiClient.put(`/api/projects/${projectId}/equipment/${id}`, data);
    return response.data;
  },

  delete: async (projectId: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${projectId}/equipment/${id}`);
  },
};
