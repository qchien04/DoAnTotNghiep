import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  InvoicePaymentRequest,
  InvoiceFilterParams,
} from '@/shared/types/landlord';

export const useBills = (params?: InvoiceFilterParams) => {
  const listQuery = useQuery({
    queryKey: landlordKeys.billList(params),
    queryFn: () => landlordService.getInvoices(params),
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
    mutationFn: (dto: CreateInvoiceRequest) => landlordService.createInvoice(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
      if (variables.isDraft) {
        message.success('Đã lưu hóa đơn dưới dạng BẢN NHÁP!');
      } else {
        message.success('Phát hành hóa đơn thành công!');
      }
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
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateInvoiceRequest }) =>
      landlordService.updateInvoice(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
      message.success('Cập nhật hóa đơn thành công!');
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
    mutationFn: (id: string | number) => landlordService.publishInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
      message.success(`Đã ban hành hóa đơn #${id} thành công!`);
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
    mutationFn: ({ id, cancelReason }: { id: string | number; cancelReason: string }) =>
      landlordService.cancelInvoice(id, cancelReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
      message.success('Đã hủy hóa đơn thành công!');
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
    mutationFn: ({ id, dto }: { id: string | number; dto: InvoicePaymentRequest }) =>
      landlordService.confirmPayment(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
      message.success('Đã xác nhận thu tiền và gạch nợ hóa đơn thành công!');
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
