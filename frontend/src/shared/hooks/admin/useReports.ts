import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/shared/services/adminService';
import { adminKeys } from '../queryKeys';
import { EnforceReportDto } from '@/shared/types/admin';

export const useReports = () => {
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: adminKeys.reports(),
    queryFn: () => adminService.getDisputeReports(),
    select: (res) => res.data,
  });

  const enforceMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: EnforceReportDto }) =>
      adminService.enforceReportAction(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });

  return {
    reports: reportsQuery.data ?? [],
    isLoading: reportsQuery.isLoading,
    isError: reportsQuery.isError,
    error: reportsQuery.error,
    refetch: reportsQuery.refetch,
    enforceReportAction: enforceMutation.mutateAsync,
    isEnforcing: enforceMutation.isPending,
  };
};
