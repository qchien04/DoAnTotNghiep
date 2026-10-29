import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import { CreateServiceDto, UpdateServiceDto } from '@/shared/types/landlord';

export const useServices = () => {
  const servicesQuery = useQuery({
    queryKey: landlordKeys.services(),
    queryFn: () => landlordService.getServices(),
    select: (res) => res.data,
  });

  return {
    services: servicesQuery.data ?? [],
    isLoading: servicesQuery.isLoading,
    isError: servicesQuery.isError,
    error: servicesQuery.error,
    refetch: servicesQuery.refetch,
  };
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateServiceDto) => landlordService.createService(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.services() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo dịch vụ');
    },
  });

  return {
    createService: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateServiceDto }) =>
      landlordService.updateService(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.services() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật dịch vụ');
    },
  });

  return {
    updateService: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string | number) => landlordService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.services() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể xóa dịch vụ');
    },
  });

  return {
    deleteService: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
};
