import { apiClient } from '../client/base-client';
import type { Evaluator, EvaluationAssignment, Evaluation, EvaluationInput } from '../types/evaluateur.types';

class EvaluateurApi {
  private readonly base = '/evaluations';

  async getAllEvaluators(): Promise<Evaluator[]> {
    return apiClient.get<Evaluator[]>(`${this.base}/evaluators`);
  }

  async getAllAssignments(editionId?: number): Promise<EvaluationAssignment[]> {
    const params = editionId ? `?editionId=${editionId}` : '';
    return apiClient.get<EvaluationAssignment[]>(`${this.base}/assignments${params}`);
  }

  /**
   * Récupère toutes les affectations et filtre côté client par businessPlanId.
   * Le serveur ne supporte que ?editionId comme filtre.
   */
  async getAssignmentsByBusinessPlan(businessPlanId: number): Promise<EvaluationAssignment[]> {
    const all = await apiClient.get<EvaluationAssignment[]>(`${this.base}/assignments`);
    return all.filter((a: EvaluationAssignment) => a.businessPlanId === businessPlanId);
  }

  /**
   * GET /evaluations/business-plans/:id
   */
  async getEvaluationsByBusinessPlan(businessPlanId: number): Promise<Evaluation[]> {
    return apiClient.get<Evaluation[]>(`${this.base}/business-plans/${businessPlanId}`);
  }

  async createAssignment(data: {
    businessPlanId: number;
    evaluatorId: number;
    copaEditionId: number;
    deadline?: string;
  }): Promise<EvaluationAssignment> {
    return apiClient.post<EvaluationAssignment>(`${this.base}/assignments`, data);
  }

  async submitEvaluation(data: EvaluationInput): Promise<Evaluation> {
    return apiClient.post<Evaluation>(`${this.base}`, data);
  }

  async getMyEvaluations(): Promise<Evaluation[]> {
    return apiClient.get<Evaluation[]>(`${this.base}/my/evaluations`);
  }

  async getStats(): Promise<any> {
    return apiClient.get(`${this.base}/stats`);
  }
}

export const evaluateurApi = new EvaluateurApi();
