import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { tenantService } from '@/shared/services/tenantService';
import { tenantKeys } from '../queryKeys';
import { ApplyRoommateDto } from '@/shared/types/tenant';

export const useApplications = (postId?: string) => {
  const applicationsQuery = useQuery({
    queryKey: postId ? tenantKeys.postApplications(postId) : tenantKeys.applications(),
    queryFn: () =>
      postId
        ? tenantService.getApplicationsByPostId(postId)
        : Promise.resolve({ code: '00', message: '', data: [] as any, serverTime: '', service: '' }),
    enabled: Boolean(postId),
    select: (res) => res.data,
  });

  return {
    applications: applicationsQuery.data ?? [],
    isLoading: applicationsQuery.isLoading,
    isError: applicationsQuery.isError,
    error: applicationsQuery.error,
    refetch: applicationsQuery.refetch,
  };
};

export const useApplyToGroup = () => {
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: (dto: ApplyRoommateDto) => tenantService.applyToGroup(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.postApplications(variables.postId) });
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
      message.success('Gửi đơn ứng tuyển ở ghép thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể gửi đơn ứng tuyển');
    },
  });

  return {
    applyToGroup: applyMutation.mutateAsync,
    isApplying: applyMutation.isPending,
  };
};

export const useApproveApplication = () => {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (applicationId: string) => tenantService.approveApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.applications() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
      message.success('Duyệt đơn ứng tuyển thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể duyệt đơn ứng tuyển');
    },
  });

  return {
    approveApplication: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
  };
};

export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  const rejectMutation = useMutation({
    mutationFn: ({ applicationId, reason }: { applicationId: string; reason?: string }) =>
      tenantService.rejectApplication(applicationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.applications() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
      message.success('Đã từ chối đơn ứng tuyển!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể từ chối đơn ứng tuyển');
    },
  });

  return {
    rejectApplication: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
};
