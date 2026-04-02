import { apiClient } from '../client/base-client';
import { ChangePasswordPayload } from '../types/auth.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user?: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    roles: string;
    image: string;
  };
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

class AuthApi {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/auth/admin/login', data, {
      skipCache: true,
      showToast: false,
    });
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    return apiClient.post('/auth/register', data, {
      skipCache: true,
    });
  }

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout', {}, {
      skipAuth: false,
      showToast: false,
    });
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return apiClient.post('/auth/refresh', { refreshToken }, {
      skipAuth: true,
      skipCache: true,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    return apiClient.post('/auth/forgot-password', { email }, {
      skipCache: true,
      errorMessage: 'Erreur lors de l\'envoi de l\'email de réinitialisation',
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    return apiClient.post('/auth/reset-password', { token, password }, {
      skipCache: true,
    });
  }

  changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    return apiClient.post(`/auth/change-password`, payload);
  }
}

export const authApi = new AuthApi();