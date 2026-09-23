import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import { CreateServiceDto, UpdateServiceDto } from '@/shared/types/landlord';

export const useServices = () => {
  const queryClient = useQueryClient();

  const servicesQuery = useQuery({
    queryKey: landlordKeys.services(),
    queryFn: () => landlordService.getServices(),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateServiceDto) => landlordService.createService(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.services() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateServiceDto }) =>
      landlordService.updateService(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.services() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => landlordService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.services() });
    },
  });

  return {
    services: Array.isArray(servicesQuery.data) ? servicesQuery.data : (servicesQuery.data as any)?.items ?? [],
    isLoading: servicesQuery.isLoading,
    isError: servicesQuery.isError,
    error: servicesQuery.error,
    refetch: servicesQuery.refetch,
    // Mutations
    createService: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateService: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteService: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
