'use client';

import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/api/types/roles.types';
import { Loader, Text } from 'rizzui';
import { useEffect } from 'react';
import { useAuthRoles } from '@/lib/api/hooks/use-auth-roles';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requiredPermissions?: string[];
    redirectTo?: string;
    fallback?: React.ReactNode;
}

export function RoleGuard({
    children,
    allowedRoles,
    requiredPermissions,
    redirectTo = '/access-denied',
    fallback,
}: RoleGuardProps) {
    const router = useRouter();
    const { hasAnyRole, hasAnyPermission, isLoading, isAuthenticated } = useAuthRoles();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/signin');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader variant="spinner" size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    // Vérifier les rôles
    if (allowedRoles && allowedRoles.length > 0) {
        if (!hasAnyRole(...allowedRoles)) {
            if (fallback) return <>{fallback}</>;
            router.push(redirectTo);
            return null;
        }
    }

    // Vérifier les permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
        if (!hasAnyPermission(...requiredPermissions)) {
            if (fallback) return <>{fallback}</>;
            router.push(redirectTo);
            return null;
        }
    }

    return <>{children}</>;
}