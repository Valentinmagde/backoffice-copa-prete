export type UserStatus = 'Active' | 'Deactivated' | 'Pending';

export type AdminRoleCode =
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'COPA_MANAGER'
    | 'EVALUATOR'
    | 'TRAINER'
    | 'MENTOR'
    | 'PARTNER';

export type BeneficiaryRoleCode = 'BENEFICIARY';
export type RoleCode = AdminRoleCode | BeneficiaryRoleCode;

export interface UserRole {
    id: number;
    code: RoleCode;
    name: string;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    role: string;
    roles: string[];
    roleCode: RoleCode;
    status: UserStatus;
    bio?: string;
    isBlocked: boolean;
    isVerified: boolean;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt?: string;
    profilePhotoUrl?: any;
}

export interface UserDetail extends User {
    firstName: string;
    lastName: string;
    birthDate?: string;
    nationality?: string;
    idDocumentType?: string;
    idDocumentNumber?: string;
    isRefugee: boolean;
    userRoles: UserRole[];
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        pageCount: number;
    };
}

export interface UsersFilters {
    search?: string;
    status?: UserStatus;
    role?: AdminRoleCode;
    page?: number;
    limit?: number;
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    roleCode: string;
    status?: 'active' | 'inactive' | 'pending';
    copaEditionId?: number;
    assignmentReason?: string;
}

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    role?: RoleCode[];
    status?: UserStatus;
    isActive?: boolean;
    isBlocked?: boolean;
}

export interface AssignRolePayload {
    roleCode: RoleCode;
}

export interface PaginatedUsers {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pageCount: number;
    };
}

export interface UsersFilters {
    search?: string;
    status?: 'Active' | 'Deactivated' | 'Pending';
    role?:
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'COPA_MANAGER'
    | 'EVALUATOR'
    | 'TRAINER'
    | 'MENTOR'
    | 'PARTNER';
    page?: number;
    limit?: number;
}

export interface UpdateUserProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    profilePhotoUrl?: string;
    bio?: string;
    website?: string;
}

export interface UpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmedPassword: string;
}

interface UploadAvatarResponse {
    success: boolean;
    url: string;
    key: string;
    message: string;
}
