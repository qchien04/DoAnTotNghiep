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

  const acceptLinkMutation = useMutation({
    mutationFn: (tenantId: string) => tenantService.acceptRoomLink(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myRoom() });
    },
  });

  return {
    roomDetails: roomDetailsQuery.data,
    isLoading: roomDetailsQuery.isLoading,
    isError: roomDetailsQuery.isError,
    error: roomDetailsQuery.error,
    refetch: roomDetailsQuery.refetch,
    acceptRoomLink: acceptLinkMutation.mutateAsync,
    isAcceptingLink: acceptLinkMutation.isPending,
  };
};
