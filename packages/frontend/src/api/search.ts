import apiClient from './client';

export interface SearchResult {
  entityType: string;
  entityId: string;
  name: string;
  description: string;
  rank: number;
}

export const searchApi = {
  search: async (query: string, entityType?: string): Promise<SearchResult[]> => {
    const params = new URLSearchParams({ q: query });
    if (entityType) {
      params.append('entityType', entityType);
    }
    const response = await apiClient.get(`/api/search?${params.toString()}`);
    return response.data;
  },
};
