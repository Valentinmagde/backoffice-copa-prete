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