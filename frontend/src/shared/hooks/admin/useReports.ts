import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { adminService } from '@/shared/services/adminService';
import { adminKeys } from '../queryKeys';
import { EnforceReportDto } from '@/shared/types/admin';

export const useReports = () => {
  const reportsQuery = useQuery({
    queryKey: adminKeys.reports(),
    queryFn: () => adminService.getDisputeReports(),
    select: (res) => res.data,
  });

  return {
    reports: reportsQuery.data ?? [],
    isLoading: reportsQuery.isLoading,
    isError: reportsQuery.isError,
    error: reportsQuery.error,
    refetch: reportsQuery.refetch,
  };
};

export const useEnforceReportAction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: EnforceReportDto }) =>
      adminService.enforceReportAction(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xử lý vi phạm báo cáo');
    },
  });

  return {
    enforceReportAction: mutation.mutateAsync,
    isEnforcing: mutation.isPending,
  };
};
