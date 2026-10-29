import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { tenantService } from '@/shared/services/tenantService';
import { tenantKeys } from '../queryKeys';
import {
  CreatePostWithRoomDto,
  CreatePostWithoutRoomDto,
  UpdateRoommatePostDto,
  PostSearchParams,
} from '@/shared/types/tenant';

export const useRoommatePosts = (searchParams?: PostSearchParams) => {
  const searchQuery = useQuery({
    queryKey: tenantKeys.postSearch(searchParams),
    queryFn: () => tenantService.searchPosts(searchParams),
    select: (res) => res.data,
  });

  return {
    pageInfo: searchQuery.data,
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,
    refetch: searchQuery.refetch,
  };
};

export const useMyRoommatePosts = (params?: {
  keyword?: string;
  status?: string;
  postType?: string;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}) => {
  const myPostsQuery = useQuery({
    queryKey: [...tenantKeys.myPosts(), params],
    queryFn: () => tenantService.getMyPosts(params),
    select: (res) => res.data,
  });

  return {
    pageInfo: myPostsQuery.data,
    isLoading: myPostsQuery.isLoading,
    isError: myPostsQuery.isError,
    error: myPostsQuery.error,
    refetch: myPostsQuery.refetch,
  };
};

export const useRoommatePostDetail = (id?: string) => {
  const query = useQuery({
    queryKey: tenantKeys.postDetail(id || ''),
    queryFn: () => (id ? tenantService.getPostById(id) : Promise.reject('No id')),
    enabled: Boolean(id),
    select: (res) => res.data,
  });

  return {
    post: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCreatePostWithRoom = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreatePostWithRoomDto) => tenantService.createPostWithRoom(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.myPosts() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo bài đăng có phòng');
    },
  });

  return {
    createPostWithRoom: mutation.mutateAsync,
    isCreatingWithRoom: mutation.isPending,
  };
};

export const useCreatePostWithoutRoom = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: CreatePostWithoutRoomDto) => tenantService.createPostWithoutRoom(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.myPosts() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tạo bài đăng tìm phòng');
    },
  });

  return {
    createPostWithoutRoom: mutation.mutateAsync,
    isCreatingWithoutRoom: mutation.isPending,
  };
};

export const useUpdateRoommatePost = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoommatePostDto }) =>
      tenantService.updatePost(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.myPosts() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật bài đăng');
    },
  });

  return {
    updatePost: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

export const useCloseRoommatePost = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => tenantService.closePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.myPosts() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể đóng bài đăng');
    },
  });

  return {
    closePost: mutation.mutateAsync,
    isClosing: mutation.isPending,
  };
};

export const useCompleteRoommatePost = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => tenantService.completePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.myPosts() });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể hoàn tất / chốt bài đăng');
    },
  });

  return {
    completePost: mutation.mutateAsync,
    isCompleting: mutation.isPending,
  };
};
