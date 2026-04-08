// lib/api/endpoints/cohorts.api.ts
import { apiClient } from '../client/base-client';
import type {
    Cohort,
    CreateCohortDto,
    UpdateCohortDto,
    CohortStats,
    CohortFilters,
} from '../types/cohorts.types';

// Helper pour les paramètres de requête
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

class CohortsApi {
    private readonly base = '/reference/copa-editions';

    /**
     * Récupère toutes les cohortes (éditions)
     * GET /reference/copa-editions
     */
    async getCohorts(filters?: CohortFilters): Promise<{ data: Cohort[]; meta: any }> {
        const qs = toQueryString(filters || {});
        const response = await apiClient.get(`${this.base}/admin/${qs}`);
        // Transformer la réponse pour correspondre au format attendu
        return {
            data: Array.isArray(response) ? response : response.data || [],
            meta: response.meta || { total: response.length || 0 },
        };
    }

    /**
     * Récupère une cohorte (édition) par son ID
     * GET /reference/copa-editions/:id
     */
    async getCohortById(id: number): Promise<Cohort> {
        return apiClient.get(`${this.base}/${id}`);
    }

    /**
     * Crée une nouvelle cohorte (édition)
     * POST /reference/copa-editions
     */
    async createCohort(data: CreateCohortDto): Promise<Cohort> {
        return apiClient.post(this.base, data);
    }

    /**
     * Met à jour une cohorte (édition)
     * PUT /reference/copa-editions/:id
     */
    async updateCohort(id: number, data: UpdateCohortDto): Promise<Cohort> {
        return apiClient.put(`${this.base}/${id}`, data);
    }

    /**
     * Supprime une cohorte (édition)
     * DELETE /reference/copa-editions/:id
     */
    async deleteCohort(id: number): Promise<{ message: string }> {
        return apiClient.delete(`${this.base}/${id}`);
    }

    /**
     * Active/Désactive une cohorte (édition)
     * PATCH /reference/copa-editions/:id/toggle-status
     */
    async toggleCohortStatus(id: number): Promise<Cohort> {
        return apiClient.patch(`${this.base}/${id}/toggle-status`);
    }

    /**
     * Récupère les statistiques des cohortes
     * GET /reference/copa-editions/stats
     */
    async getCohortStats(): Promise<CohortStats> {
        return apiClient.get(`${this.base}/stats`);
    }

    /**
     * Récupère une cohorte avec ses participants
     * GET /reference/copa-editions/:id/participants
     */
    async getCohortWithParticipants(id: number): Promise<Cohort & { participants: any[] }> {
        return apiClient.get(`${this.base}/${id}/participants`);
    }

    /**
     * Récupère les cohortes actives
     * GET /reference/copa-editions/active
     */
    async getActiveCohorts(): Promise<Cohort[]> {
        return apiClient.get(`${this.base}/active`);
    }

    /**
     * Ajoute des participants à une cohorte
     * POST /reference/copa-editions/:id/participants
     */
    async addParticipants(id: number, userIds: number[]): Promise<Cohort> {
        return apiClient.post(`${this.base}/${id}/participants`, { userIds });
    }

    /**
     * Retire un participant d'une cohorte
     * DELETE /reference/copa-editions/:id/participants/:userId
     */
    async removeParticipant(id: number, userId: number): Promise<Cohort> {
        return apiClient.delete(`${this.base}/${id}/participants/${userId}`);
    }

    /**
     * Active une cohorte (édition)
     * POST /reference/copa-editions/:id/activate
     */
    async activateCohort(id: number): Promise<Cohort> {
        return apiClient.post(`${this.base}/${id}/activate`);
    }

    /**
     * Désactive une cohorte (édition)
     * POST /reference/copa-editions/:id/deactivate
     */
    async deactivateCohort(id: number): Promise<Cohort> {
        return apiClient.post(`${this.base}/${id}/deactivate`);
    }

    /**
     * Duplique une cohorte pour une nouvelle année
     * POST /reference/copa-editions/:id/duplicate
     */
    async duplicateCohort(id: number, year: number): Promise<Cohort> {
        return apiClient.post(`${this.base}/${id}/duplicate`, { year });
    }
}

export const cohortsApi = new CohortsApi();