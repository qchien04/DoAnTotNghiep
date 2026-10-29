import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { adminService } from '@/shared/services/adminService';
import { adminKeys } from '../queryKeys';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  ToggleLockUserDto,
  AdminUserFilterParams,
} from '@/shared/types/admin';

export const useAdminUsers = (params?: AdminUserFilterParams) => {
  const listQuery = useQuery({
    queryKey: adminKeys.userList(params),
    queryFn: () => adminService.getUsers(params),
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

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateAdminUserDto) => adminService.createUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo tài khoản');
    },
  });

  return {
    createUser: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateAdminUserDto }) =>
      adminService.updateUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật người dùng');
    },
  });

  return {
    updateUser: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useToggleLockUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: ToggleLockUserDto }) =>
      adminService.toggleLockUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể thay đổi trạng thái khóa tài khoản');
    },
  });

  return {
    toggleLockUser: mutation.mutateAsync,
    isTogglingLock: mutation.isPending,
  };
};
