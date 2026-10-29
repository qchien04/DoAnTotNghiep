import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import { UpdateComplaintProgressDto, ComplaintFilterParams } from '@/shared/types/landlord';

export const useComplaints = (params?: ComplaintFilterParams) => {
  const listQuery = useQuery({
    queryKey: landlordKeys.complaintList(params),
    queryFn: () => landlordService.getComplaints(params),
    select: (res) => res.data,
  });

  return {
    pageInfo: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
};

export const useUpdateComplaintProgress = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateComplaintProgressDto }) =>
      landlordService.updateComplaintProgress(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.complaints() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật tiến độ xử lý sự cố');
    },
  });

  return {
    updateProgress: mutation.mutateAsync,
    isUpdatingProgress: mutation.isPending,
  };
};
