import { AxiosError } from 'axios';

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: any;
}

export class ErrorHandler {
  static handle(error: AxiosError | any): ApiError {
    if (error.isAxiosError) {
      const axiosError = error as AxiosError;
      const response = axiosError.response;

      if (!response) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Impossible de contacter le serveur',
          status: 0,
        };
      }

      switch (response.status) {
        case 400:
          return {
            code: 'BAD_REQUEST',
            message: (response.data as any)?.message || 'Requête invalide',
            status: 400,
            details: (response.data as any)?.details,
          };
        case 401:
          return {
            code: 'UNAUTHORIZED',
            message:  (response.data as any)?.message || 'Session expirée, veuillez vous reconnecter',
            status: 401,
          };
        case 403:
          return {
            code: 'FORBIDDEN',
            message:  (response.data as any)?.message || 'Vous n\'avez pas les droits nécessaires',
            status: 403,
          };
        case 404:
          return {
            code: 'NOT_FOUND',
            message:  (response.data as any)?.message || 'Ressource non trouvée',
            status: 404,
          };
        case 409:
          return {
            code: 'CONFLICT',
            message: (response.data as any)?.message || 'Conflit avec les données existantes',
            status: 409,
          };
        case 422:
          return {
            code: 'VALIDATION_ERROR',
            message: 'Données invalides',
            status: 422,
            details: (response.data as any)?.errors,
          };
        case 429:
          return {
            code: 'TOO_MANY_REQUESTS',
            message: 'Trop de requêtes, veuillez réessayer plus tard',
            status: 429,
          };
        case 500:
          return {
            code: 'SERVER_ERROR',
            message:  (response.data as any)?.message || 'Erreur serveur, veuillez réessayer plus tard',
            status: 500,
          };
        default:
          return {
            code: 'UNKNOWN_ERROR',
            message: (response.data as any)?.message || 'Une erreur est survenue',
            status: response.status,
          };
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Une erreur inattendue est survenue',
      status: 0,
    };
  }
}

export const errorHandler = ErrorHandler.handle;