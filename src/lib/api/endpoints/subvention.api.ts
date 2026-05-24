import { apiClient } from '../client/base-client';
import type { Subvention, SubventionTranche } from '../types/subvention.types';

class SubventionApi {
  private readonly base = '/subventions';

  async getAll(): Promise<Subvention[]> {
    return apiClient.get<Subvention[]>(this.base);
  }

  async getById(id: number): Promise<Subvention> {
    return apiClient.get<Subvention>(`${this.base}/${id}`);
  }

  async getStats(): Promise<{ totalSubventions: number; totalAwardedAmount: number; totalReleasedAmount: number }> {
    return apiClient.get(`${this.base}/stats`);
  }

  async approveTranche(subventionId: number, trancheId: number): Promise<SubventionTranche> {
    return apiClient.patch<SubventionTranche>(`${this.base}/${subventionId}/tranches/${trancheId}/approve`, {});
  }
}

export const subventionApi = new SubventionApi();
