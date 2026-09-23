import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/shared/services/adminService';
import { adminKeys } from '../queryKeys';
import {
  CreateLifestyleCriterionDto,
  UpdateLifestyleCriterionDto,
} from '@/shared/types/admin';

export const useMasterData = () => {
  const queryClient = useQueryClient();

  const criteriaQuery = useQuery({
    queryKey: adminKeys.masterData(),
    queryFn: () => adminService.getMasterData(),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateLifestyleCriterionDto) => adminService.createCriterion(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.masterData() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLifestyleCriterionDto }) =>
      adminService.updateCriterion(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.masterData() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCriterion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.masterData() });
    },
  });

  return {
    criteria: criteriaQuery.data ?? [],
    isLoading: criteriaQuery.isLoading,
    isError: criteriaQuery.isError,
    error: criteriaQuery.error,
    refetch: criteriaQuery.refetch,
    createCriterion: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCriterion: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCriterion: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
