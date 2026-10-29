import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import {
  CreateBillDto,
  UpdateBillDto,
  ConfirmPaymentDto,
  BillFilterParams,
} from '@/shared/types/landlord';

export const useBills = (params?: BillFilterParams) => {
  const listQuery = useQuery({
    queryKey: landlordKeys.billList(params),
    queryFn: () => landlordService.getBills(params),
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

export const useCreateBill = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateBillDto) => landlordService.createBill(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo hóa đơn');
    },
  });

  return {
    createBill: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateBill = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateBillDto }) =>
      landlordService.updateBill(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật hóa đơn');
    },
  });

  return {
    updateBill: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const usePublishBill = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string | number) => landlordService.publishBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể ban hành hóa đơn');
    },
  });

  return {
    publishBill: mutation.mutateAsync,
    isPublishing: mutation.isPending,
  };
};

export const useCancelBill = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, reason }: { id: string | number; reason: string }) =>
      landlordService.cancelBill(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể hủy hóa đơn');
    },
  });

  return {
    cancelBill: mutation.mutateAsync,
    isCancelling: mutation.isPending,
  };
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: ConfirmPaymentDto }) =>
      landlordService.confirmPayment(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xác nhận thanh toán');
    },
  });

  return {
    confirmPayment: mutation.mutateAsync,
    isConfirming: mutation.isPending,
  };
};
