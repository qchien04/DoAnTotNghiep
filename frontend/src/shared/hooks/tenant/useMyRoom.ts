import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '@/shared/services/tenantService';
import { tenantKeys } from '../queryKeys';

export const useMyRoom = () => {
  const queryClient = useQueryClient();

  const roomDetailsQuery = useQuery({
    queryKey: tenantKeys.myRoom(),
    queryFn: () => tenantService.getMyRoomDetails(),
    select: (res) => res.data,
  });

  const contractsQuery = useQuery({
    queryKey: tenantKeys.myContracts(),
    queryFn: () => tenantService.getMyContracts(),
    select: (res) => res.data || [],
  });

  const acceptLinkMutation = useMutation({
    mutationFn: (invitationId: string | number) => tenantService.acceptRoomLink(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myRoom() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.myContracts() });
    },
  });

  const rejectLinkMutation = useMutation({
    mutationFn: ({ invitationId, reason }: { invitationId: string | number; reason?: string }) =>
      tenantService.rejectRoomLink(invitationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myRoom() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.myContracts() });
    },
  });

  return {
    roomDetails: roomDetailsQuery.data,
    isLoading: roomDetailsQuery.isLoading,
    isError: roomDetailsQuery.isError,
    error: roomDetailsQuery.error,
    refetch: roomDetailsQuery.refetch,
    contracts: contractsQuery.data || [],
    isContractsLoading: contractsQuery.isLoading,
    refetchContracts: contractsQuery.refetch,
    acceptRoomLink: acceptLinkMutation.mutateAsync,
    isAcceptingLink: acceptLinkMutation.isPending,
    rejectRoomLink: rejectLinkMutation.mutateAsync,
    isRejectingLink: rejectLinkMutation.isPending,
  };
};

export const useMyContracts = () => {
  const query = useQuery({
    queryKey: tenantKeys.myContracts(),
    queryFn: () => tenantService.getMyContracts(),
    select: (res) => res.data || [],
  });

  return {
    contracts: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
