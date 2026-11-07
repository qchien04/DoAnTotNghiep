import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import { CreateTenantDto, UpdateTenantDto, TenantFilterParams } from '@/shared/types/landlord';

export const useTenants = (params?: TenantFilterParams) => {
  const listQuery = useQuery({
    queryKey: landlordKeys.tenantList(params),
    queryFn: () => landlordService.getTenants(params),
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

export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateTenantDto) => landlordService.createTenant(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      message.success('Thêm khách thuê thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể thêm khách thuê');
    },
  });

  return {
    createTenant: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateTenantDto }) =>
      landlordService.updateTenant(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.tenants() });
      message.success('Cập nhật khách thuê thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật khách thuê');
    },
  });

  return {
    updateTenant: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string | number) => landlordService.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      message.success('Xóa khách thuê thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xóa khách thuê');
    },
  });

  return {
    deleteTenant: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};

export const useInviteTenantLink = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ tenantId, keyword }: { tenantId: string | number; keyword: string }) =>
      landlordService.inviteTenantLink(tenantId, keyword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.tenants() });
      message.success('Đã gửi lời mời liên kết tài khoản!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể gửi lời mời liên kết');
    },
  });

  return {
    inviteTenantLink: mutation.mutateAsync,
    isInviting: mutation.isPending,
  };
};

export const useCancelTenantInvitation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (tenantId: string | number) => landlordService.cancelTenantInvitation(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.tenants() });
      message.success('Đã hủy lời mời liên kết!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể hủy lời mời liên kết');
    },
  });

  return {
    cancelInvitation: mutation.mutateAsync,
    isCancellingInvite: mutation.isPending,
  };
};
