import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import { CreateRoomDto, UpdateRoomDto, RoomFilterParams } from '@/shared/types/landlord';

export const useRooms = (params?: RoomFilterParams) => {
  const listQuery = useQuery({
    queryKey: landlordKeys.roomList(params),
    queryFn: () => landlordService.getRooms(params),
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

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateRoomDto) => landlordService.createRoom(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo phòng trọ');
    },
  });

  return {
    createRoom: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateRoomDto }) =>
      landlordService.updateRoom(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật phòng trọ');
    },
  });

  return {
    updateRoom: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string | number) => landlordService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xóa phòng trọ');
    },
  });

  return {
    deleteRoom: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};
