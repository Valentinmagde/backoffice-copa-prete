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
    async getStatsCards(): Promise<DashboardStats> {
        return apiClient.get('/dashboard/stats');
    }

    /**
     * Récupère les candidatures par secteur
     * GET /dashboard/sectors
     */
    async getCandidatesBySector(): Promise<SectorData[]> {
        return apiClient.get('/dashboard/sectors');
    }

    /**
     * Récupère les inscriptions par région
     * GET /dashboard/regions
     */
    async getRegionalInscriptions(): Promise<RegionData[]> {
        return apiClient.get('/dashboard/regions');
    }

    /**
     * Récupère l'analyse par genre et catégorie
     * GET /dashboard/gender-category
     */
    async getGenderCategoryAnalysis(): Promise<GenderCategoryAnalysis[]> {
        return apiClient.get('/dashboard/gender-category');
    }

    /**
     * Récupère l'évolution des inscriptions
     * GET /dashboard/trend?months=12
     */
    async getRegistrationTrend(months: number = 12): Promise<RegistrationTrend[]> {
        return apiClient.get('/dashboard/trend', { params: { months } });
    }

    /**
     * Récupère le pipeline par statut
     * GET /dashboard/pipeline
     */
    async getStatusPipeline(): Promise<StatusPipeline[]> {
        return apiClient.get('/dashboard/pipeline');
    }

    /**
     * Récupère les dernières candidatures
     * GET /dashboard/recent-applications?limit=21
     */
    async getRecentApplications(limit: number = 21): Promise<RecentApplication[]> {
        return apiClient.get('/dashboard/recent-applications', { params: { limit } });
    }

    /**
     * Récupère toutes les données du dashboard en un seul appel
     * GET /dashboard/full
     */
    async getFullDashboardData(): Promise<FullDashboardData> {
        return apiClient.get('/dashboard/full');
    }

    async getCompanyStatusAnalysis(): Promise<Array<{ status: string; count: number; percentage: number }>> {
        return apiClient.get('/dashboard/company-status');
    }

    async getRegistrationTrendByPeriod(period: string): Promise<any> {
        return apiClient.get(`/dashboard/trend/${period}`);
    }
}

export const dashboardApi = new DashboardApi();