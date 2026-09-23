import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import {
  CreateContractDto,
  UpdateContractDto,
  TerminateContractDto,
  ContractFilterParams,
} from '@/shared/types/landlord';

export const useContracts = (params?: ContractFilterParams) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: landlordKeys.contractList(params),
    queryFn: () => landlordService.getContracts(params),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateContractDto) => landlordService.createContract(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.contracts() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateContractDto }) =>
      landlordService.updateContract(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.contracts() });
    },
  });

  const terminateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: TerminateContractDto }) =>
      landlordService.terminateContract(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.contracts() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
    },
  });

  return {
    contracts: Array.isArray(listQuery.data) ? listQuery.data : (listQuery.data as any)?.items ?? [],
    pageInfo: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
    // Mutations
    createContract: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateContract: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    terminateContract: terminateMutation.mutateAsync,
    isTerminating: terminateMutation.isPending,
  };
};
