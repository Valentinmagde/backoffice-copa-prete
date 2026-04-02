import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { usersApi } from '../endpoints/users.api';
import { CreateUserPayload, UpdateUserPayload, User, UsersFilters } from '../types/users.types';
import toast from 'react-hot-toast';

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Centralisés ici pour que les invalidations soient toujours cohérentes
export const userKeys = {
  all: () => ['users'] as const,
  lists: () => ['users', 'list'] as const,
  adminStaff: (f?: UsersFilters) => ['users', 'admin-staff', f ?? {}] as const,
  details: () => ['users', 'detail'] as const,
  detail: (id: number) => ['users', 'detail', id] as const,
  me: () => ['users', 'me'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Profil de l'utilisateur connecté */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => usersApi.getCurrentUser(),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/** Détail d'un utilisateur par ID */
export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Liste paginée du staff admin
 * (SUPER_ADMIN | ADMIN | COPA_MANAGER | EVALUATOR | TRAINER | MENTOR | PARTNER)
 * placeholderData garde les données précédentes pendant le chargement de la nouvelle page
 */
export function useAdminStaff(filters: UsersFilters = {}) {
  return useQuery({
    queryKey: userKeys.adminStaff(filters),
    queryFn: () => usersApi.getAdminStaff(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Créer un utilisateur */
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      usersApi.createUser(payload),
    onSuccess: () => {
      // Invalider toutes les listes
      qc.invalidateQueries({ queryKey: userKeys.adminStaff() });
    },
  });
}

/** Mettre à jour un utilisateur */
export function useUpdateUser(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      usersApi.updateUser(id, payload),
    onSuccess: (updatedUser) => {
      // Mise à jour directe du cache → pas de refetch inutile
      qc.setQueryData<User>(userKeys.detail(id), updatedUser);
      qc.invalidateQueries({ queryKey: userKeys.adminStaff() });
    },
  });
}

/** Mettre à jour son propre profil */
export function useUpdateCurrentUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      usersApi.updateCurrentUser(payload),
    onSuccess: (updatedUser) => {
      qc.setQueryData<User>(userKeys.me(), updatedUser);
    },
  });
}

/** Supprimer (soft delete) un utilisateur */
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: (_, id) => {
      // Retirer du cache détail + invalider les listes
      qc.removeQueries({ queryKey: userKeys.detail(id) });
      qc.invalidateQueries({ queryKey: userKeys.adminStaff() });
    },
  });
}

/** Supprimer plusieurs utilisateurs */
export function useDeleteUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => usersApi.deleteUsers(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.adminStaff() });
    },
  });
}

/** Assigner un rôle à un utilisateur */
export function useAssignRole(userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleCode: string) =>
      usersApi.assignRole(userId, roleCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.adminStaff() });
    },
  });
}

/** Bloquer ou débloquer un utilisateur */
export function useToggleBlock(userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (block: boolean) =>
      block
        ? usersApi.blockUser(userId)
        : usersApi.unblockUser(userId),
    onSuccess: (updatedUser) => {
      qc.setQueryData<User>(userKeys.detail(userId), updatedUser);
      qc.invalidateQueries({ queryKey: userKeys.adminStaff() });
    },
  });
}

/** Vérifier manuellement un utilisateur */
export function useVerifyUser(userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => usersApi.verifyUser(userId),
    onSuccess: (updatedUser) => {
      qc.setQueryData<User>(userKeys.detail(userId), updatedUser);
      qc.invalidateQueries({ queryKey: userKeys.adminStaff() });
    },
  });
}

/** Upload avatar */
export function useUploadAvatar(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

// ─── Avatar Mutations ─────────────────────────────────────────────────────────

/**
 * Uploader l'avatar de l'utilisateur connecté
 */
export function useUploadMyAvatar() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => usersApi.uploadMyAvatar(file),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: userKeys.me() });
      toast.success('Photo de profil mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de l\'upload');
    },
  });
}

/**
 * Uploader l'avatar d'un utilisateur spécifique (admin seulement)
 */
export function useUploadUserAvatar() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: number; file: File }) =>
      usersApi.uploadUserAvatar(userId, file),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.adminStaff() });
      toast.success('Photo de profil mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de l\'upload');
    },
  });
}

/**
 * Supprimer l'avatar de l'utilisateur connecté
 */
export function useDeleteMyAvatar() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.deleteMyAvatar(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me() });
      toast.success('Photo de profil supprimée');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la suppression');
    },
  });
}

/**
 * Supprimer l'avatar d'un utilisateur spécifique (admin seulement)
 */
export function useDeleteUserAvatar() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => usersApi.deleteUserAvatar(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.adminStaff() });
      toast.success('Photo de profil supprimée');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la suppression');
    },
  });
}