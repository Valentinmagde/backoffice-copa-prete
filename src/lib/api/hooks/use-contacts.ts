import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '../endpoints/contact.api';
import type { ContactFilters } from '../types/contact.types';
import toast from 'react-hot-toast';

const keys = {
  all: () => ['contacts'] as const,
  list: (filters: ContactFilters) => ['contacts', 'list', filters] as const,
  detail: (id: number) => ['contacts', 'detail', id] as const,
};

export function useContacts(filters: ContactFilters = {}) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn: () => contactApi.getAll(filters),
  });
}

export function useContact(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => contactApi.getById(id),
    enabled: !!id,
  });
}

export function useMarkContactAsRead(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => contactApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all() });
    },
  });
}

export function useRespondToContact(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (response: string) => contactApi.respond(id, response),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all() });
      toast.success('Réponse envoyée avec succès');
    },
    onError: () => toast.error('Erreur lors de l\'envoi de la réponse'),
  });
}

export function useCloseContact(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => contactApi.close(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all() });
      toast.success('Message clôturé');
    },
    onError: () => toast.error('Erreur lors de la clôture'),
  });
}
