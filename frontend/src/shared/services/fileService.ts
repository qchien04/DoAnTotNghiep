import apiClient from './api';
import { ResponseData } from '@/shared/types/api';

export interface FileUploadResponse {
  url: string;
  fileName: string;
  originalFileName: string;
  size: number;
  contentType: string;
}

export const fileService = {
  /**
   * Tải lên 1 tệp tin / hình ảnh
   */
  uploadImage: async (file: File, folder: string = 'rooms'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await apiClient.post<ResponseData<FileUploadResponse>>(
      '/api/v1/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return res.data?.data?.url || '';
  },

  /**
   * Tải lên nhiều tệp tin / hình ảnh cùng lúc
   */
  uploadMultipleImages: async (files: File[], folder: string = 'rooms'): Promise<string[]> => {
    if (!files || files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    const res = await apiClient.post<ResponseData<FileUploadResponse[]>>(
      '/api/v1/files/upload-multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const list: FileUploadResponse[] = res.data?.data || [];
    return list.map((item: FileUploadResponse) => item.url).filter(Boolean);
  },
};
