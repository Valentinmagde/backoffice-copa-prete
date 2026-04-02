import { apiClient } from '../client/base-client';
import type {
  User,
  UserDetail,
  PaginatedResponse,
  UsersFilters,
  CreateUserPayload,
  UpdateUserPayload,
  AssignRolePayload,
  PaginatedUsers,
} from '../types/users.types';

// ─── Helper : query string ────────────────────────────────────────────────────
function toQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ─── API Class ────────────────────────────────────────────────────────────────
class UsersApi {
  private readonly base = '/users';

  // ── Lecture ─────────────────────────────────────────────────────────────

  getCurrentUser(): Promise<User> {
    return apiClient.get(`${this.base}/profile`);
  }

  getUserById(id: number): Promise<User> {
    return apiClient.get(`${this.base}/${id}`);
  }

  getAdminStaff(filters: UsersFilters = {}): Promise<PaginatedUsers> {
    const qs = toQueryString(filters);
    return apiClient.get(`${this.base}/admin-staff${qs}`);
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  createUser(payload: CreateUserPayload): Promise<User> {
    return apiClient.post(`${this.base}`, payload);
  }

  updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
    return apiClient.put(`${this.base}/${id}`, payload);
  }

  updateCurrentUser(payload: UpdateUserPayload): Promise<User> {
    return apiClient.patch(`${this.base}/me`, payload);
  }

  deleteUser(id: number): Promise<{ message: string }> {
    return apiClient.delete(`${this.base}/${id}`);
  }

  deleteUsers(ids: number[]): Promise<{ message: string }> {
    return apiClient.delete(`${this.base}/bulk`, { data: { ids } });
  }

  // ── Rôles ────────────────────────────────────────────────────────────────

  assignRole(
    userId: number,
    roleCode: string,
  ): Promise<{ message: string }> {
    return apiClient.post(`${this.base}/${userId}/roles`, { roleCode });
  }

  removeRole(userId: number, roleCode: string): Promise<void> {
    return apiClient.delete(`${this.base}/${userId}/roles/${roleCode}`);
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  blockUser(id: number): Promise<User> {
    return apiClient.post(`${this.base}/${id}/block`, {});
  }

  unblockUser(id: number): Promise<User> {
    return apiClient.post(`${this.base}/${id}/unblock`, {});
  }

  verifyUser(id: number): Promise<User> {
    return apiClient.post(`${this.base}/${id}/verify`, {});
  }

  uploadAvatar(id: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    // Ne pas forcer Content-Type — le navigateur gère le boundary multipart
    return apiClient.post(`${this.base}/${id}/avatar`, formData);
  }

  // ── Avatar ───────────────────────────────────────────────────────────────

  /**
   * Uploader l'avatar de l'utilisateur connecté
   */
  uploadMyAvatar(file: File): Promise<{ url: string; key: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(`${this.base}/me/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Uploader l'avatar d'un utilisateur spécifique (admin seulement)
   */
  uploadUserAvatar(userId: number, file: File): Promise<{ url: string; key: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(`${this.base}/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Supprimer l'avatar de l'utilisateur connecté
   */
  deleteMyAvatar(): Promise<{ message: string }> {
    return apiClient.delete(`${this.base}/me/avatar`);
  }

  /**
   * Supprimer l'avatar d'un utilisateur spécifique (admin seulement)
   */
  deleteUserAvatar(userId: number): Promise<{ message: string }> {
    return apiClient.delete(`${this.base}/${userId}/avatar`);
  }
}

export const usersApi = new UsersApi();