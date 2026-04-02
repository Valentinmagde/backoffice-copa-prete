import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '../client/base-client';

type QueryFn<TData> = () => Promise<TData>;

export function useApiQuery<TData = any, TError = AxiosError>(
  key: string[],
  urlOrFn: string | QueryFn<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & {
    params?: Record<string, any>;
    enabled?: boolean;
  }
): UseQueryResult<TData, TError> {
  const { params, ...queryOptions } = options || {};

  // Déterminer si c'est une URL ou une fonction
  const queryFn = typeof urlOrFn === 'string'
    ? async () => {
      const urlWithParams = params
        ? `${urlOrFn}?${new URLSearchParams(params).toString()}`
        : urlOrFn;
      return apiClient.get<TData>(urlWithParams);
    }
    : urlOrFn;

  return useQuery<TData, TError>({
    queryKey: [...key, params],
    queryFn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    // retry: (failureCount, error) => {
    //   if ((error as AxiosError)?.response?.status === 401) return false;
    //   return failureCount < 1;
    // },
    ...queryOptions,
  });
}