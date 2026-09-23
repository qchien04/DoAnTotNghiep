/**
 * Định dạng phản hồi chuẩn đồng bộ với ResponseData từ Backend
 */
export interface ResponseData<T> {
  code: string;
  message: string;
  errorDesc?: string;
  data: T;
  serverTime: string;
  service: string;
}

/**
 * Định dạng phân trang chuẩn PageResponse
 */
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PagingParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
