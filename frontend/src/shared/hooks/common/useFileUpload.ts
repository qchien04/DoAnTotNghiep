import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { fileService } from '@/shared/services/fileService';

export const useUploadMultipleImages = () => {
  const mutation = useMutation({
    mutationFn: ({ files, folder }: { files: File[]; folder?: string }) =>
      fileService.uploadMultipleImages(files, folder),
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tải ảnh lên');
    },
  });

  return {
    uploadMultipleImages: (files: File[], folder: string = 'rooms') =>
      mutation.mutateAsync({ files, folder }),
    isUploading: mutation.isPending,
  };
};

export const useUploadImage = () => {
  const mutation = useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      fileService.uploadImage(file, folder),
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || 'Không thể tải ảnh lên');
    },
  });

  return {
    uploadImage: (file: File, folder: string = 'rooms') =>
      mutation.mutateAsync({ file, folder }),
    isUploading: mutation.isPending,
  };
};
