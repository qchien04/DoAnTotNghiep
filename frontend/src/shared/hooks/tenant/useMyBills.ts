import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { tenantService } from '@/shared/services/tenantService';
import { tenantKeys } from '../queryKeys';

export const useMyBills = (params?: {
  keyword?: string;
  status?: string;
  billingPeriod?: string;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}) => {
  const billsQuery = useQuery({
    queryKey: [...tenantKeys.myBills(), params],
    queryFn: () => tenantService.getMyBills(params),
    select: (res) => res.data,
  });

  return {
    pageInfo: billsQuery.data,
    isLoading: billsQuery.isLoading,
    isError: billsQuery.isError,
    error: billsQuery.error,
    refetch: billsQuery.refetch,
  };
};

export const useConfirmPaymentTransferred = () => {
  const queryClient = useQueryClient();

  const confirmTransferredMutation = useMutation({
    mutationFn: (billId: string) => tenantService.confirmPaymentTransferred(billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myBills() });
      message.success('Hệ thống đã ghi nhận thông báo chuyển khoản! Đang chờ chủ trọ xác nhận.');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xác nhận thanh toán');
    },
  });

  return {
    confirmTransferred: confirmTransferredMutation.mutateAsync,
    isConfirming: confirmTransferredMutation.isPending,
  };
};

export const useVietQRPayment = (billId?: string) => {
  const query = useQuery({
    queryKey: billId ? tenantKeys.vietQRPayment(billId) : ['vietqr'],
    queryFn: () =>
      billId
        ? tenantService.getVietQRPayment(billId)
        : Promise.resolve({ code: '00', message: '', data: null as any, serverTime: '', service: '' }),
    enabled: Boolean(billId),
    select: (res) => res.data,
  });

  return {
    qrData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
