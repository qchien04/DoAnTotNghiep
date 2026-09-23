import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/shared/services/adminService';
import { adminKeys } from '../queryKeys';

export const useAdminAnalytics = () => {
  const query = useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: () => adminService.getAnalytics(),
    select: (res) => res.data,
  });

  return {
    analytics: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
