import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import { mpmeApi } from '../endpoints/mpme.api';
import type {
    MPMEInscrit,
    MPMECandidature,
    PaginatedMPMEInscrits,
    PaginatedMPMECandidatures,
    MPMEFilters,
} from '../types/mpme.types';
import toast from 'react-hot-toast';

export const mpmeKeys = {
    all: () => ['mpme'] as const,
    inscrits: () => ['mpme', 'inscrits'] as const,
    inscritsList: (filters?: MPMEFilters) => ['mpme', 'inscrits', 'list', filters ?? {}] as const,
    inscritDetail: (id: number) => ['mpme', 'inscrits', 'detail', id] as const,
    candidatures: () => ['mpme', 'candidatures'] as const,
    candidaturesList: (filters?: MPMEFilters) => ['mpme', 'candidatures', 'list', filters ?? {}] as const,
    candidatureDetail: (id: number) => ['mpme', 'candidatures', 'detail', id] as const,
};

// ─── MPME Inscrits ────────────────────────────────────────────────────────────
export function useMPMEInscrits(filters: MPMEFilters = {}) {
    return useQuery({
        queryKey: mpmeKeys.inscritsList(filters),
        queryFn: async () => mpmeApi.getInscrits(filters),
        staleTime: 30 * 1000,
        // placeholderData: keepPreviousData,
    });
}

export function useMPMEInscrit(id: number) {
    return useQuery({
        queryKey: mpmeKeys.inscritDetail(id),
        queryFn: () => mpmeApi.getInscritById(id),
        enabled: !!id && id > 0,
        staleTime: 5 * 60 * 1000,
    });
}

// ─── MPME Candidatures ────────────────────────────────────────────────────────

export function useMPMECandidatures(filters: MPMEFilters = {}) {
    if (!filters.isProfileComplete) {
        filters.isProfileComplete = true;
    }

    return useQuery({
        queryKey: mpmeKeys.candidaturesList(filters),
        queryFn: () => mpmeApi.getCandidatures(filters),
        staleTime: 30 * 1000,
        // placeholderData: keepPreviousData,
    });
}

export function useMPMECandidature(id: number) {
    return useQuery({
        queryKey: mpmeKeys.candidatureDetail(id),
        queryFn: () => mpmeApi.getCandidatureById(id),
        enabled: !!id && id > 0,
        staleTime: 5 * 60 * 1000,
    });
}

export function useEvaluateMPMECandidature(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (evaluation: { score: number; comments: string }) =>
            mpmeApi.evaluateCandidature(id, evaluation),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpmeKeys.candidatureDetail(id) });
            qc.invalidateQueries({ queryKey: mpmeKeys.candidaturesList() });
            toast.success('Candidature évaluée avec succès');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Erreur lors de l\'évaluation');
        },
    });
}

// lib/api/hooks/use-mpme.ts

export function usePreselectBeneficiary(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (comment: string) =>
            mpmeApi.preselectBeneficiary(id, comment),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['mpme', 'inscrits', 'detail', id] });
            qc.invalidateQueries({ queryKey: ['mpme', 'inscrits'] });
            toast.success('Candidat présélectionné avec succès');
        },
        onError: (err: any) => toast.error(err?.message || 'Erreur'),
    });
}

export function useSelectBeneficiary(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (comment: string) =>
            mpmeApi.selectBeneficiary(id, comment),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['mpme', 'inscrits', 'detail', id] });
            qc.invalidateQueries({ queryKey: ['mpme', 'inscrits'] });
            toast.success('Candidat sélectionné avec succès');
        },
        onError: (err: any) => toast.error(err?.message || 'Erreur'),
    });
}

export function useRejectBeneficiary(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (reason: string) =>
            mpmeApi.rejectBeneficiary(id, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['mpme', 'inscrits', 'detail', id] });
            qc.invalidateQueries({ queryKey: ['mpme', 'inscrits'] });
            toast.success('Candidat rejeté');
        },
        onError: (err: any) => toast.error(err?.message || 'Erreur'),
    });
}