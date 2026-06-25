import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { errorHandler } from '../utils/error-handler';
import { retryLogic } from '../utils/retry-logic';
import { cacheManager } from '../cache/cache-manager';

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  enableCache?: boolean;
  enableRetry?: boolean;
  retryAttempts?: number;
}

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipCache?: boolean;
  cacheTTL?: number;
  retry?: boolean;
  retryAttempts?: number;
  showToast?: boolean;
  errorMessage?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Ajouter le token d'authentification
        if (!config.skipAuth) {
          const session = await getSession();
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }
        }

        // Ajouter des headers de tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Timestamp'] = Date.now().toString();

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => this.handleSuccess(response),
      (error) => this.handleError(error)
    );
  }

  private async handleSuccess(response: AxiosResponse) {
    // Logging des requêtes réussies
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: Date.now() - (response.config.headers['X-Timestamp'] as number),
      });
    }
    return response;
  }

  private async handleError(error: AxiosError) {
    const originalRequest = error.config as any;
    
    // Gestion du refresh token — uniquement pour les requêtes idempotentes (GET)
    // Les POST/PUT/PATCH/DELETE ne sont pas retentés pour éviter les doubles envois
    const isIdempotent = !originalRequest.method || originalRequest.method.toUpperCase() === 'GET';
    if (error.response?.status === 401 && !originalRequest._retry && isIdempotent) {
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => {
          return this.client(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      try {
        const session = await getSession();
        if (session?.refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_NESTJS_API_URL}/auth/refresh`,
            { refreshToken: session.refreshToken },
          );

          const { accessToken } = response.data;

          this.processQueue(null, accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return this.client(originalRequest);
        } else {
          // Pas de refresh token → session expirée
          this.processQueue(new Error('Session expirée'), null);
          await signOut({ redirect: true, callbackUrl: '/auth/signin' });
          return Promise.reject(new Error('Session expirée'));
        }
      } catch (refreshError) {
        this.processQueue(refreshError, null);
        await signOut({ redirect: true, callbackUrl: '/auth/signin' });
        return Promise.reject(refreshError);
      } finally {
        this.isRefreshing = false;
      }
    }

    // Gestion centralisée des erreurs
    const handledError = errorHandler(error);
    
    // Afficher des toasts pour les erreurs importantes
    if (originalRequest.showToast !== false) {
      // Utiliser votre système de toast
      console.error(handledError.message);
    }

    return Promise.reject(handledError);
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    const {
      skipCache = false,
      cacheTTL = 5 * 60 * 1000, // 5 minutes
      retry = false,
      retryAttempts = 1,
      ...axiosOptions
    } = options;

    // La clé de cache doit inclure les query params : sinon deux appels au
    // même endpoint avec des params différents (ex: editionId) se renvoient
    // mutuellement le résultat caché de l'autre.
    const cacheKey = axiosOptions.params
      ? `${url}?${JSON.stringify(axiosOptions.params)}`
      : url;

    // Vérifier le cache
    if (!skipCache && axiosOptions.method === 'GET') {
      const cached = cacheManager.get<T>(cacheKey);
      if (cached) return cached;
    }

    const makeRequest = async () => {
      const response = await this.client.request<T>({
        url,
        ...axiosOptions,
      });
      return response.data;
    };

    try {
      let data: T;
      if (retry) {
        data = await retryLogic(makeRequest, retryAttempts);
      } else {
        data = await makeRequest();
      }

      // Mettre en cache
      if (!skipCache && axiosOptions.method === 'GET') {
        cacheManager.set(cacheKey, data, cacheTTL);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Méthodes CRUD simplifiées
  get<T = any>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  post<T = any>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'POST', data });
  }

  put<T = any>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'PUT', data });
  }

  patch<T = any>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'PATCH', data });
  }

  delete<T = any>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

// Instance unique
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_NESTJS_API_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  enableCache: true,
  enableRetry: true,
});