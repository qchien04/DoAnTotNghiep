import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import { CreateTenantDto, UpdateTenantDto, TenantFilterParams } from '@/shared/types/landlord';

export const useTenants = (params?: TenantFilterParams) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: landlordKeys.tenantList(params),
    queryFn: () => landlordService.getTenants(params),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTenantDto) => landlordService.createTenant(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateTenantDto }) =>
      landlordService.updateTenant(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.tenants() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => landlordService.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ tenantId, keyword }: { tenantId: string | number; keyword: string }) =>
      landlordService.inviteTenantLink(tenantId, keyword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.tenants() });
    },
  });

  return {
    tenants: Array.isArray(listQuery.data) ? listQuery.data : (listQuery.data as any)?.items ?? [],
    pageInfo: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    // Mutations
    createTenant: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTenant: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteTenant: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    inviteTenantLink: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
  };
};
