import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import { CreateBuildingDto, UpdateBuildingDto, BuildingFilterParams } from '@/shared/types/landlord';

export const useBuildings = (params?: BuildingFilterParams) => {
  const listQuery = useQuery({
    queryKey: landlordKeys.buildingList(params),
    queryFn: () => landlordService.getBuildings(params),
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

export const useCreateBuilding = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateBuildingDto) => landlordService.createBuilding(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo tòa nhà');
    },
  });

  return {
    createBuilding: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateBuilding = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateBuildingDto }) =>
      landlordService.updateBuilding(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật tòa nhà');
    },
  });

  return {
    updateBuilding: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useDeleteBuilding = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string | number) => landlordService.deleteBuilding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xóa tòa nhà');
    },
  });

  return {
    deleteBuilding: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};
