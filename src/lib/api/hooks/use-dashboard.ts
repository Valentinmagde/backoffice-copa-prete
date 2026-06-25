import { useApiQuery } from './use-api-query';
import {
    dashboardApi,
    DashboardStats,
    SectorData,
    RegionData,
    GenderCategoryAnalysis,
    RegistrationTrend,
    StatusPipeline,
    RecentApplication,
    FullDashboardData
} from '../endpoints/dashboard.api';

export function useDashboardStats(editionId?: number) {
    return useApiQuery<DashboardStats>(
        ['dashboard', 'stats', editionId != null ? String(editionId) : 'all'],
        () => dashboardApi.getStatsCards(editionId),
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchInterval: 10 * 60 * 1000, // Rafraîchir toutes les 10 minutes
        }
    );
}

// Hook pour les candidatures par secteur
export function useCandidatesBySector(editionId?: number) {
    return useApiQuery<SectorData[]>(
        ['dashboard', 'sectors', editionId != null ? String(editionId) : 'all'],
        () => dashboardApi.getCandidatesBySector(editionId),
        {
            staleTime: 10 * 60 * 1000, // 10 minutes
        }
    );
}

// Hook pour les inscriptions par région
export function useRegionalInscriptions(editionId?: number) {
    return useApiQuery<RegionData[]>(
        ['dashboard', 'regions', editionId != null ? String(editionId) : 'all'],
        () => dashboardApi.getRegionalInscriptions(editionId),
        {
            staleTime: 10 * 60 * 1000,
        }
    );
}

// Hook pour l'analyse genre/catégorie
export function useGenderCategoryAnalysis(editionId?: number) {
    return useApiQuery<GenderCategoryAnalysis[]>(
        ['dashboard', 'gender-category', editionId != null ? String(editionId) : 'all'],
        () => dashboardApi.getGenderCategoryAnalysis(editionId),
        {
            staleTime: 10 * 60 * 1000,
        }
    );
}

// Hook pour l'évolution des inscriptions
export function useRegistrationTrend(months: number = 12, editionId?: number) {
    return useApiQuery<RegistrationTrend[]>(
        ['dashboard', 'trend', months.toString(), editionId != null ? String(editionId) : 'all'],
        () => dashboardApi.getRegistrationTrend(months, editionId),
        {
            staleTime: 5 * 60 * 1000,
        }
    );
}

// Hook pour le pipeline par statut
export function useStatusPipeline(editionId?: number) {
    return useApiQuery<StatusPipeline[]>(
        ['dashboard', 'pipeline', editionId != null ? String(editionId) : 'all'],
        () => dashboardApi.getStatusPipeline(editionId),
        {
            staleTime: 5 * 60 * 1000,
        }
    );
}

// Hook pour les dernières candidatures
export function useRecentApplications(limit: number = 21, editionId?: number) {
    return useApiQuery<RecentApplication[]>(
        ['dashboard', 'recent-applications', limit.toString(), editionId != null ? String(editionId) : 'all'],
        () => dashboardApi.getRecentApplications(limit, editionId),
        {
            staleTime: 2 * 60 * 1000, // 2 minutes
        }
    );
}

// Hook pour toutes les données du dashboard (appel unique)
export function useFullDashboardData(editionId?: number) {
    return useApiQuery<FullDashboardData>(
        ['dashboard', 'full', editionId != null ? String(editionId) : 'all'],
        () => dashboardApi.getFullDashboardData(editionId),
        {
            staleTime: 5 * 60 * 1000,
            refetchInterval: 10 * 60 * 1000,
        }
    );
}

export function useCompanyStatusAnalysis(editionId?: number) {
    return useApiQuery<Array<{ status: string; count: number; percentage: number }>>(
        ['dashboard', 'company-status', editionId != null ? String(editionId) : 'all'],
        () => dashboardApi.getCompanyStatusAnalysis(editionId),
        {
            staleTime: 10 * 60 * 1000,
        }
    );
}

export function useRegistrationTrendByPeriod(period: string = 'month', editionId?: number) {
    return useApiQuery<Array<{ label: string; registrations: number; completed: number; submitted: number }>>(
        ['dashboard', 'trend', period, editionId != null ? String(editionId) : 'all'],
        () => dashboardApi.getRegistrationTrendByPeriod(period, editionId),
        {
            staleTime: 5 * 60 * 1000,
        }
    );
}