// lib/api/hooks/use-cohorts.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '../client/base-client';
import { cohortsApi } from '../endpoints/cohorts.api';
import type { Cohort, CreateCohortDto, UpdateCohortDto, CohortFilters } from '../types/cohorts.types';
import toast from 'react-hot-toast';

export const cohortsKeys = {
    all: () => ['cohorts'] as const,
    lists: () => ['cohorts', 'list'] as const,
    list: (filters?: CohortFilters) => ['cohorts', 'list', filters ?? {}] as const,
    detail: (id: number) => ['cohorts', 'detail', id] as const,
    stats: () => ['cohorts', 'stats'] as const,
    active: () => ['cohorts', 'active'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Récupère la liste des cohortes (éditions COPA)
 */
export function useCohorts(filters?: CohortFilters) {
    return useQuery({
        queryKey: cohortsKeys.list(filters),
        queryFn: () => cohortsApi.getCohorts(filters),
        staleTime: 30 * 1000,
        // placeholderData: keepPreviousData,
    });
}

/**
 * Récupère une cohorte par son ID
 */
export function useCohort(id: number) {
    return useQuery({
        queryKey: cohortsKeys.detail(id),
        queryFn: () => cohortsApi.getCohortById(id),
        enabled: !!id && id > 0,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Récupère la cohorte active
 */
export function useActiveCohort() {
    return useQuery({
        queryKey: cohortsKeys.active(),
        queryFn: () => cohortsApi.getActiveCohorts(),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Récupère les statistiques des cohortes
 */
export function useCohortStats() {
    return useQuery({
        queryKey: cohortsKeys.stats(),
        queryFn: () => cohortsApi.getCohortStats(),
        staleTime: 5 * 60 * 1000,
    });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Crée une nouvelle cohorte (édition COPA)
 */
export function useCreateCohort() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCohortDto) => cohortsApi.createCohort(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: cohortsKeys.lists() });
            qc.invalidateQueries({ queryKey: cohortsKeys.stats() });
            toast.success('Cohorte créée avec succès');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Erreur lors de la création';
            toast.error(message);
        },
    });
}

/**
 * Met à jour une cohorte (édition COPA)
 */
export function useUpdateCohort() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCohortDto }) => 
            cohortsApi.updateCohort(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: cohortsKeys.lists() });
            qc.invalidateQueries({ queryKey: cohortsKeys.detail(id) });
            qc.invalidateQueries({ queryKey: cohortsKeys.stats() });
            toast.success('Cohorte mise à jour avec succès');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Erreur lors de la mise à jour';
            toast.error(message);
        },
    });
}

/**
 * Supprime une cohorte (édition COPA)
 */
export function useDeleteCohort() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => cohortsApi.deleteCohort(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: cohortsKeys.lists() });
            qc.invalidateQueries({ queryKey: cohortsKeys.stats() });
            toast.success('Cohorte supprimée avec succès');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Erreur lors de la suppression';
            toast.error(message);
        },
    });
}

/**
 * Active une cohorte (édition COPA)
 */
export function useActivateCohort() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => cohortsApi.activateCohort(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: cohortsKeys.lists() });
            qc.invalidateQueries({ queryKey: cohortsKeys.active() });
            qc.invalidateQueries({ queryKey: cohortsKeys.stats() });
            toast.success('Cohorte activée avec succès');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Erreur lors de l\'activation';
            toast.error(message);
        },
    });
}

/**
 * Désactive une cohorte (édition COPA)
 */
export function useDeactivateCohort() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => cohortsApi.deactivateCohort(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: cohortsKeys.lists() });
            qc.invalidateQueries({ queryKey: cohortsKeys.active() });
            qc.invalidateQueries({ queryKey: cohortsKeys.stats() });
            toast.success('Cohorte désactivée avec succès');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Erreur lors de la désactivation';
            toast.error(message);
        },
    });
}

// ─── Phases ───────────────────────────────────────────────────────────────────

export const phaseKeys = {
    byEdition: (editionId: number) => ['cohorts', 'phases', editionId] as const,
};

export function useCohortePhases(editionId: number) {
    return useQuery({
        queryKey: phaseKeys.byEdition(editionId),
        queryFn: () => apiClient.get(`/reference/copa-phases/edition/${editionId}`),
        enabled: !!editionId && editionId > 0,
        staleTime: 30 * 1000,
    });
}

export function useTogglePhase(editionId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (phaseId: number) => apiClient.post(`/reference/copa-phases/${phaseId}/toggle`, {}),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: phaseKeys.byEdition(editionId) });
            toast.success('Phase mise à jour');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour');
        },
    });
}

export function useUpdatePhaseDates(editionId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ phaseId, startDate, endDate }: { phaseId: number; startDate: string; endDate: string }) =>
            apiClient.patch(`/reference/copa-phases/${phaseId}/dates`, { startDate, endDate }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: phaseKeys.byEdition(editionId) });
            toast.success('Dates de la phase mises à jour');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour');
        },
    });
}

/**
 * Duplique une cohorte pour une nouvelle année
 */
export function useDuplicateCohort() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, year }: { id: number; year: number }) => 
            cohortsApi.duplicateCohort(id, year),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: cohortsKeys.lists() });
            qc.invalidateQueries({ queryKey: cohortsKeys.stats() });
            toast.success('Cohorte dupliquée avec succès');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Erreur lors de la duplication';
            toast.error(message);
        },
    });
}