import { useQuery } from '@tanstack/react-query';
import { amenityService } from '@/shared/services/amenityService';
import { amenityKeys } from '../queryKeys';

export const useAmenities = () => {
  const query = useQuery({
    queryKey: amenityKeys.publicList(),
    queryFn: () => amenityService.getAllPublicAmenities(),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });

  return {
    amenities: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
