import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintApi } from '../endpoints/complaint.api';
import toast from 'react-hot-toast';

const keys = {
  all: () => ['complaints'] as const,
  list: () => ['complaints', 'list'] as const,
  detail: (id: number) => ['complaints', 'detail', id] as const,
};

export function useComplaints() {
  return useQuery({
    queryKey: keys.list(),
    queryFn: () => complaintApi.getAll(),
  });
}

export function useComplaint(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => complaintApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateComplaintStatus(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ statusCode, response }: { statusCode: string; response?: string }) =>
      complaintApi.updateStatus(id, statusCode, response),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list() });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast.success('Statut mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
}
