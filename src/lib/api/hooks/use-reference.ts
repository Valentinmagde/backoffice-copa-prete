import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client/base-client';
import { referenceApi } from '../endpoints/reference.api';

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