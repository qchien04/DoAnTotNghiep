import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { adminService } from '@/shared/services/adminService';
import { adminKeys } from '../queryKeys';
import {
  CreateLifestyleCriterionDto,
  UpdateLifestyleCriterionDto,
} from '@/shared/types/admin';

export const useMasterData = () => {
  const criteriaQuery = useQuery({
    queryKey: adminKeys.masterData(),
    queryFn: () => adminService.getMasterData(),
    select: (res) => res.data,
  });

  return {
    criteria: criteriaQuery.data ?? [],
    isLoading: criteriaQuery.isLoading,
    isError: criteriaQuery.isError,
    error: criteriaQuery.error,
    refetch: criteriaQuery.refetch,
  };
};

export const useCreateCriterion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateLifestyleCriterionDto) => adminService.createCriterion(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.masterData() });
      message.success('Thêm tiêu chí lối sống thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo tiêu chí lối sống');
    },
  });

  return {
    createCriterion: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateCriterion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLifestyleCriterionDto }) =>
      adminService.updateCriterion(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.masterData() });
      message.success('Cập nhật tiêu chí lối sống thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật tiêu chí lối sống');
    },
  });

  return {
    updateCriterion: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useDeleteCriterion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCriterion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.masterData() });
      message.success('Xóa tiêu chí lối sống thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xóa tiêu chí lối sống');
    },
  });

  return {
    deleteCriterion: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};
