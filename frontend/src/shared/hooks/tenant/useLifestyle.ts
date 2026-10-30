import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { tenantService } from '@/shared/services/tenantService';
import { SaveLifestyleAnswersRequest } from '@/shared/types/tenant';

export const useLifestyleQuestions = () => {
  const query = useQuery({
    queryKey: ['lifestyle', 'questions'],
    queryFn: () => tenantService.getLifestyleQuestions(),
    select: (res) => res.data ?? [],
    staleTime: 1000 * 60 * 30, // 30 phút cache
  });

  return {
    questions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useUserLifestyleProfile = () => {
  const query = useQuery({
    queryKey: ['lifestyle', 'profile'],
    queryFn: () => tenantService.getUserLifestyleProfile(),
    select: (res) => res.data,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useSaveLifestyleProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: SaveLifestyleAnswersRequest) => tenantService.saveUserLifestyleProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifestyle', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', 'posts'] });
      message.success('Lưu thông tin khảo sát lối sống thành công!');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu khảo sát lối sống');
    },
  });

  return {
    saveProfile: mutation.mutateAsync,
    isSavingProfile: mutation.isPending,
  };
};
