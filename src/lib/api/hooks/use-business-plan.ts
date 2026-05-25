import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessPlanApi } from '../endpoints/business-plan.api';
import toast from 'react-hot-toast';

export function useBusinessPlans(params?: { search?: string; page?: number; limit?: number; statusId?: number }) {
  return useQuery({
    queryKey: ['business-plans', params],
    queryFn: () => businessPlanApi.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useBusinessPlanByBeneficiary(beneficiaryId: number) {
  return useQuery({
    queryKey: ['business-plan', 'beneficiary', beneficiaryId],
    queryFn: () => businessPlanApi.getByBeneficiary(beneficiaryId),
    enabled: !!beneficiaryId && beneficiaryId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBusinessPlanById(id: number) {
  return useQuery({
    queryKey: ['business-plan', id],
    queryFn: () => businessPlanApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBusinessPlanDocument(id: number) {
  return useQuery({
    queryKey: ['business-plan', id, 'document'],
    queryFn: () => businessPlanApi.getDocument(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnonymizeBusinessPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => businessPlanApi.anonymize(id),
    onSuccess: (updated) => {
      qc.setQueriesData<any>({ queryKey: ['business-plans'] }, (old) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.map((p: any) => (p.id === updated.id ? { ...p, isAnonymized: updated.isAnonymized } : p)) };
      });
      toast.success(updated.isAnonymized ? 'Plan marqué comme anonymisé' : 'Anonymisation annulée');
    },
    onError: () => toast.error("Erreur lors de l'anonymisation"),
  });
}
