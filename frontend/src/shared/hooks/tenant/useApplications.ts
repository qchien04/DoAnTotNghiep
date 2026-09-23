import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '@/shared/services/tenantService';
import { tenantKeys } from '../queryKeys';
import { ApplyRoommateDto } from '@/shared/types/tenant';

export const useApplications = (postId?: string) => {
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: postId ? tenantKeys.postApplications(postId) : tenantKeys.applications(),
    queryFn: () => (postId ? tenantService.getApplicationsByPostId(postId) : Promise.resolve({ code: '00', message: '', data: [] as any, serverTime: '', service: '' })),
    enabled: Boolean(postId),
    select: (res) => res.data,
  });

  const applyMutation = useMutation({
    mutationFn: (dto: ApplyRoommateDto) => tenantService.applyToGroup(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.postApplications(variables.postId) });
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (applicationId: string) => tenantService.approveApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.applications() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ applicationId, reason }: { applicationId: string; reason?: string }) =>
      tenantService.rejectApplication(applicationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.applications() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
    },
  });

  return {
    applications: applicationsQuery.data ?? [],
    isLoading: applicationsQuery.isLoading,
    isError: applicationsQuery.isError,
    error: applicationsQuery.error,
    refetch: applicationsQuery.refetch,
    // Mutations
    applyToGroup: applyMutation.mutateAsync,
    isApplying: applyMutation.isPending,
    approveApplication: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    rejectApplication: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
};
