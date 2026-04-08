export interface Role {
    id: number;
    code: string;
    name: string;
    description: string;
    level: number;
    isInternal: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    userCount?: number;
}

export interface CreateRoleDto {
    code: string;
    name: string;
    description: string;
    level: number;
    isInternal: boolean;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {
    id: number;
    isActive?: boolean;
}

export interface RoleStats {
    totalRoles: number;
    activeRoles: number;
    inactiveRoles: number;
    internalRoles: number;
    externalRoles: number;
    rolesByLevel: {
        level: number;
        count: number;
        roles: string[];
    }[];
}

export interface RoleWithUsers extends Role {
    users: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    }[];
}

export interface UserSession {
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        roles: string[];
    };
    accessToken: string;
    refreshToken: string;
    expires: string;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COPA_MANAGER' | 'EVALUATOR' | 'TRAINER' | 'MENTOR' | 'PARTNER' | 'BENEFICIARY';

// Hiérarchie des rôles (niveau de permission)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
    SUPER_ADMIN: 100,
    ADMIN: 90,
    COPA_MANAGER: 80,
    EVALUATOR: 70,
    TRAINER: 60,
    MENTOR: 50,
    PARTNER: 40,
    BENEFICIARY: 10,
};

// Définir les permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    SUPER_ADMIN: [
        'view_all', 'create_all', 'edit_all', 'delete_all',
        'manage_users', 'manage_roles', 'view_audit_logs',
        'manage_beneficiaries', 'manage_business_plans', 'manage_evaluations',
        'manage_subventions', 'view_reports', 'manage_cohorts'
    ],
    ADMIN: [
        'view_all', 'create_all', 'edit_all',
        'manage_users', 'manage_beneficiaries', 'manage_business_plans',
        'manage_evaluations', 'manage_subventions', 'view_reports', 'manage_cohorts'
    ],
    COPA_MANAGER: [
        'view_all', 'manage_beneficiaries', 'manage_business_plans',
        'view_reports', 'manage_evaluations'
    ],
    EVALUATOR: [
        'view_beneficiaries', 'evaluate_business_plans', 'view_reports'
    ],
    TRAINER: [
        'view_beneficiaries', 'manage_trainings', 'view_reports'
    ],
    MENTOR: [
        'view_beneficiaries', 'manage_mentoring', 'view_reports'
    ],
    PARTNER: [
        'view_partner_data', 'submit_partner_reports'
    ],
    BENEFICIARY: [
        'view_own_profile', 'submit_business_plan', 'view_own_subventions'
    ],
};