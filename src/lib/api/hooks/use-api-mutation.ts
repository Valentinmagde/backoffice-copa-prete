import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '../client/base-client';
import { queryClient } from '@/lib/react-query';

export type MutationMethod = 'post' | 'put' | 'patch' | 'delete';

export function useApiMutation<TData = any, TVariables = any>(
  method: MutationMethod,
  url: string,
  options?: UseMutationOptions<TData, AxiosError, TVariables> & {
    invalidateKeys?: string[];
    showToast?: boolean;
    successMessage?: string;
  }
): UseMutationResult<TData, AxiosError, TVariables> {
  const { invalidateKeys, showToast = true, successMessage, ...mutationOptions } = options || {};

  return useMutation<TData, AxiosError, TVariables>({
    mutationFn: async (variables) => {
      switch (method) {
        case 'post':
          return apiClient.post<TData>(url, variables);
        case 'put':
          return apiClient.put<TData>(url, variables);
        case 'patch':
          return apiClient.patch<TData>(url, variables);
        case 'delete':
          return apiClient.delete<TData>(url);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalider les caches si nécessaire
      if (invalidateKeys?.length) {
        invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      // Afficher un toast de succès
      if (showToast && successMessage) {
        // Utiliser votre système de toast
        console.log(`✅ ${successMessage}`);
      }

      mutationOptions.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Gestion centralisée des erreurs
      console.error(`❌ Mutation error:`, error);

      mutationOptions.onError?.(error, variables, context);
    },
  });
}