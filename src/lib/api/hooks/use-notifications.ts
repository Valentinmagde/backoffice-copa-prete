import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import { notificationApi } from '../endpoints/notification.api';
import { NotificationFilters, SendEmailDto } from '../types/notification.types';
// import toast from 'react-hot-toast';

export const notificationKeys = {
    all: () => ['notifications'] as const,
    list: (filters?: NotificationFilters) => ['notifications', 'list', filters ?? {}] as const,
    detail: (id: number) => ['notifications', 'detail', id] as const,
    templates: () => ['notifications', 'templates'] as const,
    candidates: (filters?: any) => ['notifications', 'candidates', filters ?? {}] as const,
    preselectRejectHistory: (filters?: any) => ['notifications', 'preselect-reject', filters ?? {}] as const,
};

export function useNotifications(filters: NotificationFilters = {}) {
    return useQuery({
        queryKey: notificationKeys.list(filters),
        queryFn: () => notificationApi.getNotifications(filters),
        staleTime: 30 * 1000,
    });
}

export function useNotification(id: number) {
    return useQuery({
        queryKey: notificationKeys.detail(id),
        queryFn: () => notificationApi.getNotificationById(id),
        enabled: !!id && id > 0,
    });
}

export function useSendEmail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: SendEmailDto) => notificationApi.sendEmail(dto),
        onSuccess: (data, dto) => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
            // toast.success(data.message || `Email envoyé à ${data.count} destinataire(s)`);
        },
        // onError: (error: any) => {
        //     toast.error(error?.message || 'Erreur lors de l\'envoi de l\'email');
        // },
    });
}

export function useResendEmail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: number) => notificationApi.resendEmail(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
            // toast.success('Email renvoyé avec succès');
        },
        // onError: (error: any) => {
        //     toast.error(error?.message || 'Erreur lors du renvoi');
        // },
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: number) => notificationApi.deleteNotification(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
            // toast.success('Notification supprimée');
        },
        // onError: (error: any) => {
        //     toast.error(error?.message || 'Erreur lors de la suppression');
        // },
    });
}

export function useDeleteMultipleNotifications() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: number[]) => notificationApi.deleteMultipleNotifications(ids),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
            // toast.success(`${data.count} notification(s) supprimée(s)`);
        },
        // onError: (error: any) => {
        //     toast.error(error?.message || 'Erreur lors de la suppression');
        // },
    });
}

export function useEmailTemplates() {
    return useQuery({
        queryKey: notificationKeys.templates(),
        queryFn: () => notificationApi.getTemplates(),
        staleTime: 5 * 60 * 1000,
    });
}

export function useCandidatesForNotification(filters?: { status?: string; search?: string }) {
    return useQuery({
        queryKey: notificationKeys.candidates(filters),
        queryFn: () => notificationApi.getCandidatesForNotification(filters),
        staleTime: 60 * 1000,
    });
}

export function useSendAutoEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ beneficiaryId, type }: { beneficiaryId: number; type: 'PRESELECTION' | 'REJECTION' | 'SELECTION' }) =>
      notificationApi.sendAutoEmail({ beneficiaryId, type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpme'] });
    },
  });
}

export function useSendBatchAutoEmails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, beneficiaryIds }: { type: 'PRESELECTION' | 'REJECTION' | 'SELECTION'; beneficiaryIds: number[] }) =>
      notificationApi.sendBatchEmails({ type, beneficiaryIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mpme'] });
    },
    // onError: (error: any) => {
    //   toast.error(error?.message || 'Erreur lors de l\'envoi groupé');
    // },
  });
}