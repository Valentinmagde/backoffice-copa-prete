import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client/base-client';
import { referenceApi } from '../endpoints/reference.api';
import { Status } from '../types/reference.types';

export interface Province {
  id: number;
  name: string;
}

export function useProvinces() {
  return useQuery<Province[]>({
    queryKey: ['reference', 'provinces'],
    queryFn: () => referenceApi.getProvinces(),
    staleTime: 10 * 60 * 1000, // 10 min — données stables
  });
}

export function useStatusByEntity(entityType: string) {
  return useQuery<Status[]>({
    queryKey: ['reference', 'statuses', entityType],
    queryFn: () => referenceApi.getStatusByEntity(entityType),
    staleTime: 10 * 60 * 1000, // 10 min — données stables
  });
}