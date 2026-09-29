import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '@/shared/services/tenantService';
import { SaveLifestyleAnswersRequest } from '@/shared/types/tenant';

export const useLifestyle = () => {
  const queryClient = useQueryClient();

  const questionsQuery = useQuery({
    queryKey: ['lifestyle', 'questions'],
    queryFn: () => tenantService.getLifestyleQuestions(),
    select: (res) => res.data ?? [],
    staleTime: 1000 * 60 * 30, // 30 phút cache
  });

  const profileQuery = useQuery({
    queryKey: ['lifestyle', 'profile'],
    queryFn: () => tenantService.getUserLifestyleProfile(),
    select: (res) => res.data,
  });

  const saveProfileMutation = useMutation({
    mutationFn: (data: SaveLifestyleAnswersRequest) => tenantService.saveUserLifestyleProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifestyle', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', 'posts'] });
    },
  });

  return {
    questions: questionsQuery.data ?? [],
    isLoadingQuestions: questionsQuery.isLoading,
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    refetchProfile: profileQuery.refetch,
    saveProfile: saveProfileMutation.mutateAsync,
    isSavingProfile: saveProfileMutation.isPending,
  };
};
