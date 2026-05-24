import { apiClient } from '../client/base-client';
import type { Training, TrainingSession, TrainingParticipation } from '../types/training.types';

class TrainingApi {
  private readonly base = '/training';

  async getAllTrainings(): Promise<Training[]> {
    return apiClient.get<Training[]>(this.base);
  }

  async getAllSessions(editionId?: number): Promise<TrainingSession[]> {
    const params = editionId ? `?editionId=${editionId}` : '';
    return apiClient.get<TrainingSession[]>(`${this.base}/sessions/list${params}`);
  }

  async getSessionParticipants(sessionId: number): Promise<TrainingParticipation[]> {
    return apiClient.get<TrainingParticipation[]>(`${this.base}/sessions/${sessionId}/participants`);
  }

  async updateSessionStatus(sessionId: number, status: string): Promise<TrainingSession> {
    return apiClient.patch<TrainingSession>(`${this.base}/sessions/${sessionId}/status`, { status });
  }

  async markAttendance(sessionId: number, beneficiaryId: number, present: boolean): Promise<TrainingParticipation> {
    return apiClient.patch<TrainingParticipation>(
      `${this.base}/sessions/${sessionId}/participants/${beneficiaryId}/attendance`,
      { present },
    );
  }

  async issueCertificate(sessionId: number, beneficiaryId: number): Promise<TrainingParticipation> {
    return apiClient.patch<TrainingParticipation>(
      `${this.base}/sessions/${sessionId}/participants/${beneficiaryId}/certificate`,
      {},
    );
  }
}

export const trainingApi = new TrainingApi();
