import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { tenantService } from '@/shared/services/tenantService';
import { tenantKeys } from '../queryKeys';
import { CreateTenantComplaintDto, RateComplaintDto } from '@/shared/types/tenant';

export const useMyComplaints = (params?: {
  keyword?: string;
  status?: string;
  severity?: string;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}) => {
  const complaintsQuery = useQuery({
    queryKey: [...tenantKeys.myComplaints(), params],
    queryFn: () => tenantService.getMyComplaints(params),
    select: (res) => res.data,
  });

  return {
    pageInfo: complaintsQuery.data,
    isLoading: complaintsQuery.isLoading,
    isError: complaintsQuery.isError,
    error: complaintsQuery.error,
    refetch: complaintsQuery.refetch,
  };
};

export const useSubmitComplaint = () => {
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: (dto: CreateTenantComplaintDto) => tenantService.submitComplaint(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myComplaints() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể gửi khiếu nại báo hỏng');
    },
  });

  return {
    submitComplaint: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
};

export const useRateComplaint = () => {
  const queryClient = useQueryClient();

  const rateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RateComplaintDto }) =>
      tenantService.rateComplaint(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myComplaints() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể gửi đánh giá khiếu nại');
    },
  });

  return {
    rateComplaint: rateMutation.mutateAsync,
    isRating: rateMutation.isPending,
  };
};
