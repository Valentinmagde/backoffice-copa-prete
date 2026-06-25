import { apiClient } from '../client/base-client';

export interface RegionData {
    region: string;
    count: number;
    inscriptions: number;
}

export interface DashboardStats {
    totalMpme: number;
    totalCandidatures: number;
    totalBusinessPlans: number;
    totalWomen: number;
    totalRegistratedWomen: number;
    totalSubventionsAccordees: number;
    totalSubventionsDecessees: number;
    totalPreselected: number;
    totalSelected: number;
    totalRegistered: number;
    totalRejected: number;
    emploisCrees: number;
    previousPeriod: {
        totalMpme: number;
        totalCandidatures: number;
        totalBusinessPlans: number;
        totalWomen: number;
    };
}

export interface SectorData {
    sector: string;
    total: number;
    women: number;
    men: number;
    refugees: number;
}

export interface RegionalData {
    province: string;
    inscriptions: number;
    communes: {
        name: string;
        inscriptions: number;
    }[];
}

export interface GenderCategoryAnalysis {
    genderData: {
        gender: string;
        count: number;
        percentage: number;
    }[];
    categoryData: {
        category: string;
        count: number;
        percentage: number;
    }[];
}

export interface RegistrationTrend {
    month: string;
    registrations: number;
    completed: number;
    submitted: number;
}

export interface StatusPipeline {
    status: string;
    count: number;
    percentage: number;
    color: string;
}

export interface RecentApplication {
    id: number;
    applicationCode: string;
    firstName: string;
    lastName: string;
    email: string;
    registrationDate: string;
    submissionDate: string | null;
    sector: string | null;
    status: string;
    statusColor: string;
}

export interface FullDashboardData {
    statsCards: DashboardStats;
    candidatesBySector: SectorData[];
    regionalInscriptions: RegionalData[];
    genderCategoryAnalysis: GenderCategoryAnalysis;
    registrationTrend: RegistrationTrend[];
    statusPipeline: StatusPipeline[];
    recentApplications: RecentApplication[];
}

class DashboardApi {
    /**
     * Récupère les statistiques des cartes
     * GET /dashboard/stats
     */
    async getStatsCards(editionId?: number): Promise<DashboardStats> {
        return apiClient.get('/dashboard/stats', { params: { editionId } });
    }

    /**
     * Récupère les candidatures par secteur
     * GET /dashboard/sectors
     */
    async getCandidatesBySector(editionId?: number): Promise<SectorData[]> {
        return apiClient.get('/dashboard/sectors', { params: { editionId } });
    }

    /**
     * Récupère les inscriptions par région
     * GET /dashboard/regions
     */
    async getRegionalInscriptions(editionId?: number): Promise<RegionData[]> {
        return apiClient.get('/dashboard/regions', { params: { editionId } });
    }

    /**
     * Récupère l'analyse par genre et catégorie
     * GET /dashboard/gender-category
     */
    async getGenderCategoryAnalysis(editionId?: number): Promise<GenderCategoryAnalysis[]> {
        return apiClient.get('/dashboard/gender-category', { params: { editionId } });
    }

    /**
     * Récupère l'évolution des inscriptions
     * GET /dashboard/trend?months=12
     */
    async getRegistrationTrend(months: number = 12, editionId?: number): Promise<RegistrationTrend[]> {
        return apiClient.get('/dashboard/trend', { params: { months, editionId } });
    }

    /**
     * Récupère le pipeline par statut
     * GET /dashboard/pipeline
     */
    async getStatusPipeline(editionId?: number): Promise<StatusPipeline[]> {
        return apiClient.get('/dashboard/pipeline', { params: { editionId } });
    }

    /**
     * Récupère les dernières candidatures
     * GET /dashboard/recent-applications?limit=21
     */
    async getRecentApplications(limit: number = 21, editionId?: number): Promise<RecentApplication[]> {
        return apiClient.get('/dashboard/recent-applications', { params: { limit, editionId } });
    }

    /**
     * Récupère toutes les données du dashboard en un seul appel
     * GET /dashboard/full
     */
    async getFullDashboardData(editionId?: number): Promise<FullDashboardData> {
        return apiClient.get('/dashboard/full', { params: { editionId } });
    }

    async getCompanyStatusAnalysis(editionId?: number): Promise<Array<{ status: string; count: number; percentage: number }>> {
        return apiClient.get('/dashboard/company-status', { params: { editionId } });
    }

    async getRegistrationTrendByPeriod(period: string, editionId?: number): Promise<any> {
        return apiClient.get(`/dashboard/trend/${period}`, { params: { editionId } });
    }
}

export const dashboardApi = new DashboardApi();