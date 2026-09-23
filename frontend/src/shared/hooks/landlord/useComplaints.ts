import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import { UpdateComplaintProgressDto, ComplaintFilterParams } from '@/shared/types/landlord';

export const useComplaints = (params?: ComplaintFilterParams) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: landlordKeys.complaintList(params),
    queryFn: () => landlordService.getComplaints(params),
    select: (res) => res.data,
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateComplaintProgressDto }) =>
      landlordService.updateComplaintProgress(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.complaints() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  return {
    complaints: Array.isArray(listQuery.data) ? listQuery.data : (listQuery.data as any)?.items ?? [],
    pageInfo: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    updateProgress: updateProgressMutation.mutateAsync,
    isUpdatingProgress: updateProgressMutation.isPending,
  };
};
