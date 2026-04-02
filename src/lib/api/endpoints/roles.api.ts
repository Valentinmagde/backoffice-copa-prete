import { apiClient } from '../client/base-client';
import {
    Role,
    CreateRoleDto,
    UpdateRoleDto,
    RoleStats,
    RoleWithUsers
} from '../types/roles.types';

class RolesApi {
    /**
     * Récupère tous les rôles
     * GET /roles
     */
    async getRoles(): Promise<Role[]> {
        return apiClient.get('/reference/roles');
    }

    /**
     * Récupère un rôle par son ID
     * GET /roles/:id
     */
    async getRoleById(id: number): Promise<Role> {
        return apiClient.get(`/reference/roles/${id}`);
    }

    /**
     * Récupère un rôle par son code
     * GET /roles/code/:code
     */
    async getRoleByCode(code: string): Promise<Role> {
        return apiClient.get(`/reference/roles/code/${code}`);
    }

    /**
     * Crée un nouveau rôle
     * POST /roles
     */
    async createRole(data: CreateRoleDto): Promise<Role> {
        return apiClient.post('/reference/roles', data);
    }

    /**
     * Met à jour un rôle
     * PUT /roles/:id
     */
    async updateRole(id: number, data: UpdateRoleDto): Promise<Role> {
        return apiClient.put(`/reference/roles/${id}`, data);
    }

    /**
     * Supprime un rôle (soft delete ou hard delete selon votre logique)
     * DELETE /roles/:id
     */
    async deleteRole(id: number): Promise<{ message: string }> {
        return apiClient.delete(`/reference/roles/${id}`);
    }

    /**
     * Active/Désactive un rôle
     * PATCH /roles/:id/toggle-status
     */
    async toggleRoleStatus(id: number): Promise<Role> {
        return apiClient.patch(`/reference/roles/${id}/toggle-status`);
    }

    /**
     * Récupère les statistiques des rôles
     * GET /roles/stats
     */
    async getRoleStats(): Promise<RoleStats> {
        return apiClient.get('/reference/roles/stats');
    }

    /**
     * Récupère un rôle avec ses utilisateurs
     * GET /roles/:id/users
     */
    async getRoleWithUsers(id: number): Promise<RoleWithUsers> {
        return apiClient.get(`/reference/roles/${id}/users`);
    }

    /**
     * Récupère les rôles actifs
     * GET /roles/active
     */
    async getActiveRoles(): Promise<Role[]> {
        return apiClient.get('/reference/roles/active');
    }

    /**
     * Récupère les rôles par niveau
     * GET /roles/by-level?min=50&max=100
     */
    async getRolesByLevel(minLevel?: number, maxLevel?: number): Promise<Role[]> {
        const params: any = {};
        if (minLevel !== undefined) params.min = minLevel;
        if (maxLevel !== undefined) params.max = maxLevel;
        return apiClient.get('/reference/roles/by-level', { params });
    }
}

export const rolesApi = new RolesApi();