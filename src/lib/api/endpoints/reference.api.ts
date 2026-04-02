import { apiClient } from '../client/base-client';

function toQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

class ReferenceApi {
  private readonly base = '/reference';

  /**
   * Récupérer la liste des Provinces
   */
  async getProvinces(): Promise<any[]> {
    const response = await apiClient.get(`${this.base}/provinces`);
    return response;
  }
}

export const referenceApi = new ReferenceApi();