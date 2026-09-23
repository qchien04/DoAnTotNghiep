import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import { CreateRoomDto, UpdateRoomDto, RoomFilterParams } from '@/shared/types/landlord';

export const useRooms = (params?: RoomFilterParams) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: landlordKeys.roomList(params),
    queryFn: () => landlordService.getRooms(params),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateRoomDto) => landlordService.createRoom(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateRoomDto }) =>
      landlordService.updateRoom(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => landlordService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  return {
    rooms: Array.isArray(listQuery.data) ? listQuery.data : (listQuery.data as any)?.items ?? [],
    pageInfo: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    // Mutations
    createRoom: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRoom: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteRoom: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
