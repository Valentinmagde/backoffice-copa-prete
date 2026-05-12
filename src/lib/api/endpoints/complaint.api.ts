import { apiClient } from '../client/base-client';
import type { Complaint } from '../types/complaint.types';

class ComplaintApi {
  private readonly base = '/complaints';

  async getAll(): Promise<Complaint[]> {
    return apiClient.get<Complaint[]>(this.base);
  }

  async getById(id: number): Promise<Complaint> {
    return apiClient.get<Complaint>(`${this.base}/${id}`);
  }

  async updateStatus(id: number, statusCode: string, response?: string): Promise<Complaint> {
    return apiClient.patch<Complaint>(`${this.base}/${id}/status`, { statusCode, response });
  }
}

export const complaintApi = new ComplaintApi();
