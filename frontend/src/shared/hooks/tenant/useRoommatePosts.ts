import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '@/shared/services/tenantService';
import { tenantKeys } from '../queryKeys';
import {
  CreatePostWithRoomDto,
  CreatePostWithoutRoomDto,
  UpdateRoommatePostDto,
  PostSearchParams,
} from '@/shared/types/tenant';

export const useRoommatePosts = (searchParams?: PostSearchParams) => {
  const queryClient = useQueryClient();

  const searchQuery = useQuery({
    queryKey: tenantKeys.postSearch(searchParams),
    queryFn: () => tenantService.searchPosts(searchParams),
    select: (res) => res.data,
  });

  const myPostsQuery = useQuery({
    queryKey: tenantKeys.myPosts(),
    queryFn: () => tenantService.getMyPosts(),
    select: (res) => res.data,
  });

  const createWithRoomMutation = useMutation({
    mutationFn: (dto: CreatePostWithRoomDto) => tenantService.createPostWithRoom(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
    },
  });

  const createWithoutRoomMutation = useMutation({
    mutationFn: (dto: CreatePostWithoutRoomDto) => tenantService.createPostWithoutRoom(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoommatePostDto }) =>
      tenantService.updatePost(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => tenantService.closePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => tenantService.completePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
    },
  });

  return {
    posts: searchQuery.data?.items ?? [],
    pageInfo: searchQuery.data,
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,
    refetchSearch: searchQuery.refetch,

    myPosts: myPostsQuery.data ?? [],
    isLoadingMyPosts: myPostsQuery.isLoading,
    refetchMyPosts: myPostsQuery.refetch,

    // Mutations
    createPostWithRoom: createWithRoomMutation.mutateAsync,
    isCreatingWithRoom: createWithRoomMutation.isPending,
    createPostWithoutRoom: createWithoutRoomMutation.mutateAsync,
    isCreatingWithoutRoom: createWithoutRoomMutation.isPending,
    updatePost: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    closePost: closeMutation.mutateAsync,
    isClosing: closeMutation.isPending,
    completePost: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
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

export const useMyRoommatePosts = () => {
  const queryClient = useQueryClient();

  const myPostsQuery = useQuery({
    queryKey: tenantKeys.myPosts(),
    queryFn: () => tenantService.getMyPosts(),
    select: (res) => res.data,
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => tenantService.closePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myPosts() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
    },
  });

  const lockMutation = useMutation({
    mutationFn: (id: string) => tenantService.completePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.myPosts() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.posts() });
    },
  });

  return {
    posts: myPostsQuery.data ?? [],
    isLoading: myPostsQuery.isLoading,
    isError: myPostsQuery.isError,
    error: myPostsQuery.error,
    refetch: myPostsQuery.refetch,

    closePost: closeMutation.mutateAsync,
    isClosing: closeMutation.isPending,
    lockGroup: lockMutation.mutateAsync,
    isLocking: lockMutation.isPending,
  };
};
