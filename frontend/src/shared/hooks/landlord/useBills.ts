import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import {
  CreateBillDto,
  UpdateBillDto,
  ConfirmPaymentDto,
  BillFilterParams,
} from '@/shared/types/landlord';

export const useBills = (params?: BillFilterParams) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: landlordKeys.billList(params),
    queryFn: () => landlordService.getBills(params),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateBillDto) => landlordService.createBill(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateBillDto }) =>
      landlordService.updateBill(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string | number; reason: string }) =>
      landlordService.cancelBill(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: ConfirmPaymentDto }) =>
      landlordService.confirmPayment(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.bills() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  return {
    bills: Array.isArray(listQuery.data) ? listQuery.data : (listQuery.data as any)?.items ?? [],
    pageInfo: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    // Mutations
    createBill: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateBill: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    cancelBill: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    confirmPayment: paymentMutation.mutateAsync,
    isConfirming: paymentMutation.isPending,
  };
};
