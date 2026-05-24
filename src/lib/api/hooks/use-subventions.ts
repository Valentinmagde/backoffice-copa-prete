import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subventionApi } from '../endpoints/subvention.api';
import toast from 'react-hot-toast';

const keys = {
  all: () => ['subventions'] as const,
  detail: (id: number) => ['subventions', id] as const,
  stats: () => ['subventions', 'stats'] as const,
};

export function useSubventions() {
  return useQuery({ queryKey: keys.all(), queryFn: () => subventionApi.getAll() });
}

export function useSubvention(id: number) {
  return useQuery({ queryKey: keys.detail(id), queryFn: () => subventionApi.getById(id), enabled: !!id });
}

export function useSubventionStats() {
  return useQuery({ queryKey: keys.stats(), queryFn: () => subventionApi.getStats() });
}

export function useApproveTranche(subventionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (trancheId: number) => subventionApi.approveTranche(subventionId, trancheId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all() });
      qc.invalidateQueries({ queryKey: keys.detail(subventionId) });
      toast.success('Tranche libérée avec succès');
    },
    onError: () => toast.error('Erreur lors de la libération'),
  });
}
