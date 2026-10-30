import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { landlordService } from '@/shared/services/landlordService';
import { landlordKeys } from '../queryKeys';
import {
  CreateContractDto,
  UpdateContractDto,
  TerminateContractDto,
  ContractFilterParams,
} from '@/shared/types/landlord';

export const useContracts = (params?: ContractFilterParams) => {
  const listQuery = useQuery({
    queryKey: landlordKeys.contractList(params),
    queryFn: () => landlordService.getContracts(params),
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

/**
 * Hook lấy chi tiết một hợp đồng thuê (dùng React Query cache)
 */
export const useContractDetail = (id?: string | number | null) => {
  const query = useQuery({
    queryKey: landlordKeys.contractDetail(id ? String(id) : ''),
    queryFn: () => landlordService.getContractById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });

  return {
    contract: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreateContractDto) => landlordService.createContract(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.contracts() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
      message.success('Tạo hợp đồng thuê phòng thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo hợp đồng');
    },
  });

  return {
    createContract: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateContractDto }) =>
      landlordService.updateContract(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.contracts() });
      message.success('Cập nhật hợp đồng thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật hợp đồng');
    },
  });

  return {
    updateContract: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useTerminateContract = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: TerminateContractDto }) =>
      landlordService.terminateContract(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordKeys.contracts() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.buildings() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.dashboard() });
      message.success('Thanh lý hợp đồng thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể thanh lý hợp đồng');
    },
  });

  return {
    terminateContract: mutation.mutateAsync,
    isTerminating: mutation.isPending,
  };
};
