import { ResponseData, PageResponse } from '@/shared/types/api';

/**
 * Tạo dữ liệu phản hồi thành công chuẩn ResponseData
 */
export function successResponse<T>(data: T, message = 'Thành công'): ResponseData<T> {
  return {
    code: '00',
    message,
    data,
    serverTime: new Date().toISOString(),
    service: 'mock-stayconnect-service',
  };
}

/**
 * Tạo dữ liệu phân trang chuẩn PageResponse
 */
export function pageResponse<T>(
  items: T[],
  page = 1,
  size = 10,
  totalElements?: number
): PageResponse<T> {
  const total = totalElements ?? items.length;
  const startIndex = (page - 1) * size;
  const pagedItems = items.slice(startIndex, startIndex + size);
  const totalPages = Math.ceil(total / size) || 1;

  return {
    items: pagedItems,
    page,
    size,
    totalElements: total,
    totalPages,
    last: page >= totalPages,
  };
}

/**
 * Trả về lỗi định dạng chuẩn
 */
export function errorResponse(message: string, code = '99', errorDesc?: string): ResponseData<null> {
  return {
    code,
    message,
    errorDesc: errorDesc || message,
    data: null,
    serverTime: new Date().toISOString(),
    service: 'mock-stayconnect-service',
  };
}
