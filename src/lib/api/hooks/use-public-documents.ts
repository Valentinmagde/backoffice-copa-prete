import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicDocumentsApi } from '../endpoints/public-documents.api';
import type {
  CreatePublicDocumentDto,
  UpdatePublicDocumentDto,
  PublicDocumentFilters,
} from '../types/public-documents.types';
import toast from 'react-hot-toast';

export const publicDocumentsKeys = {
  all: () => ['public-documents'] as const,
  lists: () => ['public-documents', 'list'] as const,
  list: (filters?: PublicDocumentFilters) =>
    ['public-documents', 'list', filters ?? {}] as const,
  detail: (id: number) => ['public-documents', 'detail', id] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export function usePublicDocuments(filters?: PublicDocumentFilters) {
  return useQuery({
    queryKey: publicDocumentsKeys.list(filters),
    queryFn: () => publicDocumentsApi.getPublicDocuments(filters),
    staleTime: 30 * 1000,
  });
}

export function usePublicDocument(id: number) {
  return useQuery({
    queryKey: publicDocumentsKeys.detail(id),
    queryFn: () => publicDocumentsApi.getPublicDocumentById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export function useCreatePublicDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      fileFr,
      fileRn,
    }: {
      data: CreatePublicDocumentDto;
      fileFr?: File;
      fileRn?: File;
    }) => publicDocumentsApi.createPublicDocument(data, fileFr, fileRn),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: publicDocumentsKeys.lists() });
      toast.success('Document créé avec succès');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Erreur lors de la création';
      toast.error(message);
    },
  });
}

export function useUpdatePublicDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      fileFr,
      fileRn,
    }: {
      id: number;
      data: UpdatePublicDocumentDto;
      fileFr?: File;
      fileRn?: File;
    }) => publicDocumentsApi.updatePublicDocument(id, data, fileFr, fileRn),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: publicDocumentsKeys.lists() });
      qc.invalidateQueries({ queryKey: publicDocumentsKeys.detail(id) });
      toast.success('Document mis à jour avec succès');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    },
  });
}

export function useRemovePublicDocumentFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lang }: { id: number; lang: 'fr' | 'rn' }) =>
      publicDocumentsApi.removePublicDocumentFile(id, lang),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: publicDocumentsKeys.lists() });
      qc.invalidateQueries({ queryKey: publicDocumentsKeys.detail(id) });
      toast.success('Fichier retiré avec succès');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Erreur lors de la suppression du fichier';
      toast.error(message);
    },
  });
}

export function useDeletePublicDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => publicDocumentsApi.deletePublicDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: publicDocumentsKeys.lists() });
      toast.success('Document supprimé avec succès');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });
}
