import { useQuery } from '@tanstack/react-query';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';

export const useLandlordDashboard = () => {
  const query = useQuery({
    queryKey: landlordKeys.dashboard(),
    queryFn: () => landlordService.getDashboardData(),
    select: (res) => res.data,
  });

  return {
    dashboard: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
