import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { tenantService } from '@/shared/services/tenantService';
import { tenantKeys } from '../queryKeys';

export const useMyRoom = () => {
  const query = useQuery({
    queryKey: tenantKeys.myRoom(),
    queryFn: () => tenantService.getMyRoomDetails(),
    select: (res) => res.data,
  });

  return {
    roomDetails: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useMyContracts = (params?: {
  keyword?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}) => {
  const query = useQuery({
    queryKey: [...tenantKeys.myContracts(), params],
    queryFn: () => tenantService.getMyContracts(params),
    select: (res) => res.data,
  });

  return {
    pageInfo: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useAcceptRoomLink = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (invitationId: string | number) => tenantService.acceptRoomLink(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myRoom() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.myContracts() });
      message.success('Liên kết phòng thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể liên kết phòng');
    },
  });

  return {
    acceptRoomLink: mutation.mutateAsync,
    isAccepting: mutation.isPending,
  };
};

export const useRejectRoomLink = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ invitationId, reason }: { invitationId: string | number; reason?: string }) =>
      tenantService.rejectRoomLink(invitationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myRoom() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.myContracts() });
      message.success('Đã từ chối lời mời liên kết phòng!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể từ chối liên kết phòng');
    },
  });

  return {
    rejectRoomLink: mutation.mutateAsync,
    isRejecting: mutation.isPending,
  };
};
