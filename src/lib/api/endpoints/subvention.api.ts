import { apiClient } from '../client/base-client';
import type { Subvention, SubventionTranche } from '../types/subvention.types';

class SubventionApi {
  private readonly base = '/subventions';

  async getAll(editionId?: number): Promise<Subvention[]> {
    const qs = editionId ? `?editionId=${editionId}` : '';
    return apiClient.get<Subvention[]>(`${this.base}${qs}`);
  }

  async getById(id: number): Promise<Subvention> {
    return apiClient.get<Subvention>(`${this.base}/${id}`);
  }

  async getStats(editionId?: number): Promise<{ totalSubventions: number; totalAwardedAmount: number; totalReleasedAmount: number }> {
    const qs = editionId ? `?editionId=${editionId}` : '';
    return apiClient.get(`${this.base}/stats${qs}`);
  }

  async approveTranche(subventionId: number, trancheId: number): Promise<SubventionTranche> {
    return apiClient.patch<SubventionTranche>(`${this.base}/${subventionId}/tranches/${trancheId}/approve`, {});
  }
}

export const subventionApi = new SubventionApi();
