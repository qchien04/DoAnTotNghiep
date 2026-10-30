import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { amenityService } from '@/shared/services/amenityService';
import { amenityKeys } from '../queryKeys';
import { AmenityFilterParams, CreateAmenityDto } from '@/shared/types/amenity';

export const useAdminAmenities = (params?: AmenityFilterParams) => {
  const query = useQuery({
    queryKey: amenityKeys.adminList(params),
    queryFn: () => amenityService.getAdminAmenities(params),
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

export const useCreateAmenity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateAmenityDto) => amenityService.createAmenity(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenityKeys.all });
      message.success('Thêm tiện ích mới thành công');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo tiện ích');
    },
  });

  return {
    createAmenity: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateAmenity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: number | string; dto: CreateAmenityDto }) =>
      amenityService.updateAmenity(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenityKeys.all });
      message.success('Cập nhật tiện ích thành công');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật tiện ích');
    },
  });

  return {
    updateAmenity: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useDeleteAmenity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number | string) => amenityService.deleteAmenity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenityKeys.all });
      message.success('Xóa tiện ích thành công');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xóa tiện ích');
    },
  });

  return {
    deleteAmenity: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};
