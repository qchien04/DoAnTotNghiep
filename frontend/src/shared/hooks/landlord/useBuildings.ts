import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import { CreateBuildingDto, UpdateBuildingDto, BuildingFilterParams } from '@/shared/types/landlord';

export const useBuildings = (params?: BuildingFilterParams) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: landlordKeys.buildingList(params),
    queryFn: () => landlordService.getBuildings(params),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateBuildingDto) => landlordService.createBuilding(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateBuildingDto }) =>
      landlordService.updateBuilding(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => landlordService.deleteBuilding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  return {
    buildings: Array.isArray(listQuery.data) ? listQuery.data : (listQuery.data as any)?.items ?? [],
    pageInfo: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    // Mutations
    createBuilding: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateBuilding: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteBuilding: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
