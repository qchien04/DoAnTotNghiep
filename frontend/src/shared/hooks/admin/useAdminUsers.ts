import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/shared/services/adminService';
import { adminKeys } from '../queryKeys';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  ToggleLockUserDto,
  AdminUserFilterParams,
} from '@/shared/types/admin';

export const useAdminUsers = (params?: AdminUserFilterParams) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: adminKeys.userList(params),
    queryFn: () => adminService.getUsers(params),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateAdminUserDto) => adminService.createUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateAdminUserDto }) =>
      adminService.updateUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: ToggleLockUserDto }) =>
      adminService.toggleLockUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });

  return {
    users: listQuery.data?.items ?? [],
    pageInfo: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    // Mutations
    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleLockUser: toggleLockMutation.mutateAsync,
    isTogglingLock: toggleLockMutation.isPending,
  };
};
