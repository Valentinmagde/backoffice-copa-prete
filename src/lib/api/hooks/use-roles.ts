import { useApiQuery, useApiMutation } from './use-api-query';
import { rolesApi } from '../endpoints/roles.api';
import {
    Role,
    CreateRoleDto,
    UpdateRoleDto,
    RoleStats,
    RoleWithUsers
} from '../types/roles.types';

// Query Keys - attention: useApiQuery attend un string[] comme premier paramètre
export const RolesQueryKeys = {
    all: ['roles'],
    lists: () => [...RolesQueryKeys.all, 'list'],
    list: () => [...RolesQueryKeys.lists()],
    active: () => [...RolesQueryKeys.lists(), 'active'],
    byLevel: (min?: number, max?: number) => [...RolesQueryKeys.lists(), 'level', min, max],
    details: () => [...RolesQueryKeys.all, 'detail'],
    detail: (id: number) => [...RolesQueryKeys.details(), id.toString()],
    detailByCode: (code: string) => [...RolesQueryKeys.details(), 'code', code],
    stats: () => [...RolesQueryKeys.all, 'stats'],
    withUsers: (id: number) => [...RolesQueryKeys.detail(id), 'users'],
};

/**
 * Hook pour récupérer tous les rôles
 */
export function useRoles() {
    return useApiQuery<Role[]>(
        RolesQueryKeys.list(),
        () => rolesApi.getRoles(),
        {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
        }
    );
}

/**
 * Hook pour récupérer les rôles actifs uniquement
 */
export function useActiveRoles() {
    return useApiQuery<Role[]>(
        RolesQueryKeys.active(),
        () => rolesApi.getActiveRoles(),
        {
            staleTime: 5 * 60 * 1000,
        }
    );
}

/**
 * Hook pour récupérer les rôles par niveau
 */
export function useRolesByLevel(minLevel?: number, maxLevel?: number) {
    return useApiQuery<Role[]>(
        RolesQueryKeys.byLevel(minLevel, maxLevel),
        () => rolesApi.getRolesByLevel(minLevel, maxLevel),
        {
            enabled: minLevel !== undefined || maxLevel !== undefined,
            staleTime: 5 * 60 * 1000,
        }
    );
}

/**
 * Hook pour récupérer un rôle spécifique par ID
 */
export function useRole(id: number) {
    return useApiQuery<Role>(
        RolesQueryKeys.detail(id),
        () => rolesApi.getRoleById(id),
        {
            enabled: !!id,
            staleTime: 5 * 60 * 1000,
        }
    );
}

/**
 * Hook pour récupérer un rôle par son code
 */
export function useRoleByCode(code: string) {
    return useApiQuery<Role>(
        RolesQueryKeys.detailByCode(code),
        () => rolesApi.getRoleByCode(code),
        {
            enabled: !!code,
            staleTime: 5 * 60 * 1000,
        }
    );
}

/**
 * Hook pour récupérer les statistiques des rôles
 */
export function useRoleStats() {
    return useApiQuery<RoleStats>(
        RolesQueryKeys.stats(),
        () => rolesApi.getRoleStats(),
        {
            staleTime: 5 * 60 * 1000,
        }
    );
}

/**
 * Hook pour récupérer un rôle avec ses utilisateurs
 */
export function useRoleWithUsers(id: number) {
    return useApiQuery<RoleWithUsers>(
        RolesQueryKeys.withUsers(id),
        () => rolesApi.getRoleWithUsers(id),
        {
            enabled: !!id,
            staleTime: 2 * 60 * 1000,
        }
    );
}

/**
 * Hook pour créer un nouveau rôle
 * Utilise useApiMutation avec la méthode POST
 */
export function useCreateRole() {
    return useApiMutation<Role, CreateRoleDto>(
        'post',
        '/roles',
        {
            invalidateKeys: ['roles'], // Invalide les clés commençant par 'roles'
            showToast: true,
            successMessage: 'Rôle créé avec succès',
        }
    );
}

/**
 * Hook pour mettre à jour un rôle
 */
export function useUpdateRole() {
    return useApiMutation<Role, { id: number; data: UpdateRoleDto }>(
        'put',
        '/roles', // L'URL sera dynamique dans la mutationFn
        {
            invalidateKeys: ['roles'],
            showToast: true,
            successMessage: 'Rôle mis à jour avec succès',
        }
    );
}

// Version améliorée si vous voulez une URL dynamique
export function useUpdateRoleV2() {
    return useApiMutation<Role, { id: number; data: UpdateRoleDto }>(
        'put',
        '', // URL temporaire, sera remplacée
        {
            mutationFn: async ({ id, data }) => {
                return rolesApi.updateRole(id, data);
            },
            invalidateKeys: ['roles'],
            showToast: true,
            successMessage: 'Rôle mis à jour avec succès',
        }
    );
}

/**
 * Hook pour activer/désactiver un rôle
 */
export function useToggleRoleStatus() {
    return useApiMutation<Role, number>(
        'patch',
        '', // URL temporaire
        {
            mutationFn: async (id) => {
                return rolesApi.toggleRoleStatus(id);
            },
            invalidateKeys: ['roles'],
            showToast: true,
            successMessage: 'Statut du rôle modifié avec succès',
        }
    );
}

/**
 * Hook pour supprimer un rôle
 */
export function useDeleteRole() {
    return useApiMutation<{ message: string }, number>(
        'delete',
        '', // URL temporaire
        {
            mutationFn: async (id) => {
                return rolesApi.deleteRole(id);
            },
            invalidateKeys: ['roles'],
            showToast: true,
            successMessage: 'Rôle supprimé avec succès',
        }
    );
}
