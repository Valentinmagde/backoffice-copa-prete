'use client';

import { useSession } from 'next-auth/react';
import { UserRole } from '@/lib/api/types/roles.types';

export function useAuthRoles() {
    const { data: session, status } = useSession();
    const userRoles = (session?.user?.roles as UserRole[]) || [];

    const hasRole = (role: UserRole | UserRole[]): boolean => {
        const rolesToCheck = Array.isArray(role) ? role : [role];
        return rolesToCheck.some(r => userRoles.includes(r));
    };

    const hasAnyRole = (...roles: UserRole[]): boolean => {
        return roles.some(role => userRoles.includes(role));
    };

    const hasPermission = (permission: string): boolean => {
        // SUPER_ADMIN a toutes les permissions
        if (userRoles.includes('SUPER_ADMIN')) return true;

        // Ici vous pouvez ajouter la logique de vérification des permissions
        const permissionsMap: Record<UserRole, string[]> = {
            SUPER_ADMIN: ['*'],
            ADMIN: ['manage_users', 'manage_roles', 'view_all'],
            COPA_MANAGER: ['view_all', 'manage_beneficiaries'],
            EVALUATOR: ['view_beneficiaries', 'evaluate'],
            TRAINER: ['view_beneficiaries', 'manage_trainings'],
            MENTOR: ['view_beneficiaries', 'manage_mentoring'],
            PARTNER: ['view_partner_data'],
            BENEFICIARY: ['view_own_profile'],
        };

        const userPermissions = userRoles.flatMap(role => permissionsMap[role] || []);
        return userPermissions.includes(permission) || userPermissions.includes('*');
    };

    const hasAnyPermission = (...permissions: string[]): boolean => {
        return permissions.some(permission => hasPermission(permission));
    };

    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated';

    return {
        userRoles,
        hasRole,
        hasAnyRole,
        hasPermission,
        hasAnyPermission,
        isLoading,
        isAuthenticated,
        isSuperAdmin: userRoles.includes('SUPER_ADMIN'),
        isAdmin: userRoles.includes('ADMIN'),
        isCopaManager: userRoles.includes('COPA_MANAGER'),
        isEvaluator: userRoles.includes('EVALUATOR'),
    };
}