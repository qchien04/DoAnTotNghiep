import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '@/shared/services/tenantService';
import { tenantKeys } from '../queryKeys';

export const useMyBills = () => {
  const queryClient = useQueryClient();

  const billsQuery = useQuery({
    queryKey: tenantKeys.myBills(),
    queryFn: () => tenantService.getMyBills(),
    select: (res) => res.data,
  });

  const confirmTransferredMutation = useMutation({
    mutationFn: (billId: string) => tenantService.confirmPaymentTransferred(billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myBills() });
    },
  });

  return {
    bills: billsQuery.data ?? [],
    isLoading: billsQuery.isLoading,
    isError: billsQuery.isError,
    error: billsQuery.error,
    refetch: billsQuery.refetch,
    confirmTransferred: confirmTransferredMutation.mutateAsync,
    isConfirming: confirmTransferredMutation.isPending,
  };
};

export const useVietQRPayment = (billId?: string) => {
  const query = useQuery({
    queryKey: billId ? tenantKeys.vietQRPayment(billId) : ['vietqr'],
    queryFn: () => (billId ? tenantService.getVietQRPayment(billId) : Promise.resolve({ code: '00', message: '', data: null as any, serverTime: '', service: '' })),
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
