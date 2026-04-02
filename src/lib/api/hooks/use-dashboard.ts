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

export function useDashboardStats() {
    return useApiQuery<DashboardStats>(
        ['dashboard', 'stats'],
        () => dashboardApi.getStatsCards(),
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchInterval: 10 * 60 * 1000, // Rafraîchir toutes les 10 minutes
        }
    );
}

// Hook pour les candidatures par secteur
export function useCandidatesBySector() {
    return useApiQuery<SectorData[]>(
        ['dashboard', 'sectors'],
        () => dashboardApi.getCandidatesBySector(),
        {
            staleTime: 10 * 60 * 1000, // 10 minutes
        }
    );
}

// Hook pour les inscriptions par région
export function useRegionalInscriptions() {
    return useApiQuery<RegionData[]>(
        ['dashboard', 'regions'],
        () => dashboardApi.getRegionalInscriptions(),
        {
            staleTime: 10 * 60 * 1000,
        }
    );
}

// Hook pour l'analyse genre/catégorie
export function useGenderCategoryAnalysis() {
    return useApiQuery<GenderCategoryAnalysis[]>(
        ['dashboard', 'gender-category'],
        () => dashboardApi.getGenderCategoryAnalysis(),
        {
            staleTime: 10 * 60 * 1000,
        }
    );
}

// Hook pour l'évolution des inscriptions
export function useRegistrationTrend(months: number = 12) {
    return useApiQuery<RegistrationTrend[]>(
        ['dashboard', 'trend', months.toString()],
        () => dashboardApi.getRegistrationTrend(months),
        {
            staleTime: 5 * 60 * 1000,
        }
    );
}

// Hook pour le pipeline par statut
export function useStatusPipeline() {
    return useApiQuery<StatusPipeline[]>(
        ['dashboard', 'pipeline'],
        () => dashboardApi.getStatusPipeline(),
        {
            staleTime: 5 * 60 * 1000,
        }
    );
}

// Hook pour les dernières candidatures
export function useRecentApplications(limit: number = 21) {
    return useApiQuery<RecentApplication[]>(
        ['dashboard', 'recent-applications', limit.toString()],
        () => dashboardApi.getRecentApplications(limit),
        {
            staleTime: 2 * 60 * 1000, // 2 minutes
        }
    );
}

// Hook pour toutes les données du dashboard (appel unique)
export function useFullDashboardData() {
    return useApiQuery<FullDashboardData>(
        ['dashboard', 'full'],
        () => dashboardApi.getFullDashboardData(),
        {
            staleTime: 5 * 60 * 1000,
            refetchInterval: 10 * 60 * 1000,
        }
    );
}