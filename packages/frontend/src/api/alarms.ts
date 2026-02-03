import apiClient from './client';

export interface Alarm {
  id: string;
  projectId: string;
  tagId: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  setpoint?: number;
  rationalization?: string;
  consequence?: string;
  operatorAction?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlarmDto {
  tagId: string;
  priority: Alarm['priority'];
  setpoint?: number;
  rationalization?: string;
  consequence?: string;
  operatorAction?: string;
  metadata?: Record<string, any>;
}

export const alarmsApi = {
  getAll: async (projectId: string): Promise<Alarm[]> => {
    const response = await apiClient.get(`/api/projects/${projectId}/alarms`);
    return response.data;
  },

  getById: async (projectId: string, id: string): Promise<Alarm> => {
    const response = await apiClient.get(`/api/projects/${projectId}/alarms/${id}`);
    return response.data;
  },

  create: async (projectId: string, data: CreateAlarmDto): Promise<Alarm> => {
    const response = await apiClient.post(`/api/projects/${projectId}/alarms`, data);
    return response.data;
  },

  update: async (projectId: string, id: string, data: Partial<CreateAlarmDto>): Promise<Alarm> => {
    const response = await apiClient.put(`/api/projects/${projectId}/alarms/${id}`, data);
    return response.data;
  },

  delete: async (projectId: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${projectId}/alarms/${id}`);
  },
};
