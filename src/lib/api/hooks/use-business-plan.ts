import { useQuery } from '@tanstack/react-query';
import { businessPlanApi } from '../endpoints/business-plan.api';

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
