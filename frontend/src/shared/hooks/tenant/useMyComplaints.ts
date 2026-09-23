import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '@/shared/services/tenantService';
import { tenantKeys } from '../queryKeys';
import { CreateTenantComplaintDto, RateComplaintDto } from '@/shared/types/tenant';

export const useMyComplaints = () => {
  const queryClient = useQueryClient();

  const complaintsQuery = useQuery({
    queryKey: tenantKeys.myComplaints(),
    queryFn: () => tenantService.getMyComplaints(),
    select: (res) => res.data,
  });

  const submitMutation = useMutation({
    mutationFn: (dto: CreateTenantComplaintDto) => tenantService.submitComplaint(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myComplaints() });
    },
  });

  const rateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RateComplaintDto }) =>
      tenantService.rateComplaint(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myComplaints() });
    },
  });

  return {
    complaints: complaintsQuery.data ?? [],
    isLoading: complaintsQuery.isLoading,
    isError: complaintsQuery.isError,
    error: complaintsQuery.error,
    refetch: complaintsQuery.refetch,
    submitComplaint: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    rateComplaint: rateMutation.mutateAsync,
    isRating: rateMutation.isPending,
  };
};
